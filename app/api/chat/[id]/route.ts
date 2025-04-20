import { type CoreMessage, streamText, type ToolSet } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createClient } from "@/utils/supabase/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "@/lib/redis/rate-limit";
import { safeQueryExecution } from "@/utils/supabase/error-handling";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth-utils";
import { logger } from "@/lib/utils/logger";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { performEwefAnalysis } from '@/lib/pce/pce-service';
import { MIN_CONFIDENCE_FOR_INSIGHTFUL_RESPONSE } from '@/lib/config/pce-config';
import { isAnalysisPaused } from '@/lib/redis/client';
import type { ResponseRationaleSource } from '@/lib/types/pce-types';

/**
 * POST /api/chat/[id]
 * Handles a chat message from the user, saves it, streams an AI response, and saves the assistant's reply.
 * Rate limited to 20 requests per minute per user.
 */

// Define specific limits for this endpoint (User ID based)
const endpointLimit = 60;
const endpointWindow = 60; // 1 minute

// Zod schema for route parameters
const ParamsSchema = z.object({ id: z.string().uuid() });

// Zod schema for request body (assuming message content)
const BodySchema = z.object({
  message: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  // --- Rate Limiting ---
  // Note: Rate limiting by userId only. No IP fallback.
  const rateLimitResponse = await rateLimit(request, {
    limit: endpointLimit,
    window: endpointWindow,
    keyPrefix: "chat:message", // Use a slightly different prefix
    ipFallback: { enabled: false }, // Requires User ID
  });
  if (rateLimitResponse instanceof NextResponse) {
    return rateLimitResponse; // Returns 429 response if limited
  }
  // --- End Rate Limiting ---

  const userId = await auth(request);

  // Extract the chat ID from the URL
  const chatId = params.id;

  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the chat belongs to the user
    const {
      data: chat,
      tableNotFound: chatTableNotFound,
      error: chatQueryError,
    } = await safeQueryExecution<{ id: string; user_id: string }>(
      async () =>
        await supabase
          .from("chats")
          .select("id, user_id")
          .eq("id", chatId)
          .single(),
      { fallbackData: null }
    );

    if (chatTableNotFound) {
      return NextResponse.json(
        { error: "Database tables not set up" },
        { status: 500, statusText: "Database Error: Tables not found" }
      );
    }

    if (chatQueryError) {
      return NextResponse.json(
        { error: "Error fetching chat" },
        { status: 500 }
      );
    }

    if (!chat || chat.user_id !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Parse the request body
    let messages: CoreMessage[];
    try {
      const body = await request.json();
      if (!body?.messages || !Array.isArray(body.messages)) {
        return NextResponse.json(
          { error: "Invalid request: messages missing or not an array" },
          { status: 400 }
        );
      }
      messages = body.messages;
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    // Save the user message to the database
    const userMessage = messages[messages.length - 1];
    if (!userMessage || !userMessage.role || !userMessage.content) {
      return NextResponse.json(
        { error: "Invalid user message" },
        { status: 400 }
      );
    }
    if (typeof userMessage.content !== 'string') {
      return NextResponse.json(
        { error: "User message content must be a string" },
        { status: 400 }
      );
    }

    const {
      error: insertError,
      tableNotFound: messagesTableNotFound,
    } = await safeQueryExecution(
      async () =>
        await supabase.from("chat_messages").insert({
          chat_id: chatId,
          role: userMessage.role,
          content: userMessage.content,
        }),
      { fallbackData: null }
    );

    if (messagesTableNotFound) {
      return NextResponse.json(
        { error: "Chat messages table not set up" },
        { status: 500, statusText: "Database Error: Tables not found" }
      );
    }

    if (insertError) {
      console.error("Error inserting user message:", insertError);
      return NextResponse.json(
        { error: "Error saving message" },
        { status: 500 }
      );
    }

    // --- INTEGRITY LAYER: Epistemic Boundary, Fallback, Provenance ---
    let responseRationaleSource: ResponseRationaleSource = 'Unknown';
    let assistantResponse: string | null = null;
    let analysisOutput: any = null;

    // 1. Check if analysis is paused for this session
    const analysisIsPaused = await isAnalysisPaused(chatId);
    if (analysisIsPaused) {
      // User has opted out of deep analysis for this session
      assistantResponse = 'I hear you. (Listening mode is enabled for this session.)';
      responseRationaleSource = 'User-Paused:ListeningAck';
      logger.info('Analysis paused for session; returning listening ack.', { chatId, userId, responseRationaleSource });
    } else {
      // 2. Run PCE analysis
      try {
        analysisOutput = await performEwefAnalysis(userId!, chatId, userMessage.content);
      } catch (err) {
        assistantResponse = 'I hear you.';
        responseRationaleSource = 'Error-Fallback:Generic';
        logger.error('Error in PCE analysis, returning fallback.', { chatId, userId, error: err, responseRationaleSource });
      }
      // 3. Epistemic boundary check
      if (analysisOutput) {
        const isConfident = analysisOutput.analysisConfidence >= MIN_CONFIDENCE_FOR_INSIGHTFUL_RESPONSE;
        if (!isConfident) {
          assistantResponse = 'I hear you.';
          responseRationaleSource = 'Confidence-Fallback:ListeningAck';
          logger.info('Low confidence; returning listening ack.', { chatId, userId, analysisConfidence: analysisOutput.analysisConfidence, responseRationaleSource });
        } else {
          // 4. Proceed to LLM for insightful response
          responseRationaleSource = 'PCE-Informed-LLM';
        }
      }
    }

    // If we have a fallback response, return it now (skip LLM)
    if (assistantResponse) {
      // Save the assistant message and rationale to the DB (pseudo, adjust as needed)
      await safeQueryExecution(
        async () =>
          await supabase.from('chat_messages').insert({
            chat_id: chatId,
            role: 'assistant',
            content: assistantResponse,
            response_rationale_source: responseRationaleSource,
          }),
        { fallbackData: null }
      );
      return NextResponse.json({ response: assistantResponse, responseRationaleSource });
    }

    // --- If not a fallback, proceed to LLM as before ---
    // (Insert the rationale into the DB in onFinish below)

    // Define the tools for Generative UI
    const tools: ToolSet = {
      multiple_choice_question: {
        description:
          "Ask a multiple choice question to gather structured opinion data",
        parameters: {
          type: "object",
          properties: {
            question_id: {
              type: "string",
              description: "A unique identifier for this question",
            },
            question_text: {
              type: "string",
              description: "The text of the question to ask",
            },
            options: {
              type: "array",
              description:
                "The available options for the user to choose from",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    description: "A unique identifier for this option",
                  },
                  text: {
                    type: "string",
                    description: "The text of the option",
                  },
                },
                required: ["id", "text"],
              },
            },
          },
          required: ["question_id", "question_text", "options"],
        },
      },
      slider_scale_question: {
        description:
          "Ask a question with a slider scale to gather numeric opinion data",
        parameters: {
          type: "object",
          properties: {
            question_id: {
              type: "string",
              description: "A unique identifier for this question",
            },
            question_text: {
              type: "string",
              description: "The text of the question to ask",
            },
            min: {
              type: "number",
              description: "The minimum value of the scale",
            },
            max: {
              type: "number",
              description: "The maximum value of the scale",
            },
            min_label: {
              type: "string",
              description: "Label for the minimum value",
            },
            max_label: {
              type: "string",
              description: "Label for the maximum value",
            },
            step: {
              type: "number",
              description: "The step size for the slider",
            },
            default_value: {
              type: "number",
              description: "The default value for the slider",
            },
          },
          required: ["question_id", "question_text", "min", "max"],
        },
      },
      buttons_question: {
        description: "Ask a question with button options",
        parameters: {
          type: "object",
          properties: {
            question_id: {
              type: "string",
              description: "A unique identifier for this question",
            },
            question_text: {
              type: "string",
              description: "The text of the question to ask",
            },
            options: {
              type: "array",
              description:
                "The available options for the user to choose from",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    description: "A unique identifier for this option",
                  },
                  text: {
                    type: "string",
                    description: "The text of the option",
                  },
                },
                required: ["id", "text"],
              },
            },
          },
          required: ["question_id", "question_text", "options"],
        },
      },
    };

    // Fetch previous messages for context (limit to 10 most recent)
    const {
      data: previousMessages,
      error: previousMessagesError,
      tableNotFound: previousMessagesTableNotFound,
    } = await safeQueryExecution<
      Array<{ role: string; content: string; created_at: string }>
    >(
      async () =>
        await supabase
          .from("chat_messages")
          .select("role, content, created_at")
          .eq("chat_id", chatId)
          .order("created_at", { ascending: true })
          .limit(10),
      { fallbackData: [] }
    );

    if (previousMessagesTableNotFound) {
      return NextResponse.json(
        { error: "Chat messages table not set up" },
        { status: 500, statusText: "Database Error: Tables not found" }
      );
    }

    if (previousMessagesError) {
      return NextResponse.json(
        { error: "Error fetching previous messages" },
        { status: 500 }
      );
    }

    // Format previous messages for the AI
    const contextMessages: CoreMessage[] =
      previousMessages?.map((msg) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      })) || [];

    // Add system message if not present
    if (!contextMessages.some((msg) => msg.role === "system")) {
      contextMessages.unshift({
        role: "system",
        content: `You are Pulse, an AI assistant for Global Pulse, a platform that gathers opinions on global topics.
Your goal is to engage users in meaningful conversations about important global issues,
and occasionally use structured questions (multiple choice, sliders, buttons) to gather specific data points.
Be neutral, respectful, and thoughtful. Avoid political bias. Focus on understanding the user's perspective.
Use the available tools to ask structured questions when appropriate, but maintain a natural conversation flow.`,
      });
    }

    // Combine context with the latest user message
    const allMessages: CoreMessage[] = [...contextMessages, userMessage];

    // Create an OpenAI provider instance
    const openai = createOpenAI({});

    // Ask OpenAI for a streaming chat response
    const result = await streamText({
      model: openai("gpt-4o"),
      messages: allMessages,
      tools,
      maxTokens: 1000,
      temperature: 0.7,
      async onFinish({ text }) {
        // Save the assistant's final response to the database, including rationale
        if (text) {
          const { error: assistantInsertError } = await safeQueryExecution(
            async () =>
              await supabase.from("chat_messages").insert({
                chat_id: chatId,
                role: "assistant",
                content: text,
                response_rationale_source: responseRationaleSource,
              }),
            { fallbackData: null }
          );
          if (assistantInsertError) {
            console.error("Error saving assistant message:", assistantInsertError);
          }
        }
      },
    });

    // Ensure onFinish runs by consuming the stream
    result.consumeStream();

    // Convert the response into a friendly text-stream
    const response = result.toDataStreamResponse();

    // Add rate limit headers to the response if available
    if (
      typeof rateLimitResponse === "object" &&
      rateLimitResponse !== null &&
      typeof (rateLimitResponse as Headers).forEach === "function"
    ) {
      (rateLimitResponse as Headers).forEach((value: string, key: string) => {
        response.headers.set(key, value);
      });
    }

    return response;
  } catch (error: unknown) {
    console.error("Error processing chat request:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
