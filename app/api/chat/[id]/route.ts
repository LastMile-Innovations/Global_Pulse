import { type CoreMessage, streamText, type ToolSet } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createClient } from "@/utils/supabase/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "@/lib/redis/rate-limit";
import { safeQueryExecution } from "@/utils/supabase/error-handling";
import { NextResponse } from "next/server";

/**
 * POST /api/chat/[id]
 * Handles a chat message from the user, saves it, streams an AI response, and saves the assistant's reply.
 * Rate limited to 20 requests per minute per user.
 */
export async function POST(request: NextRequest) {
  // Extract the chat ID from the URL
  const chatId = request.nextUrl.pathname.split("/").pop();

  // Apply rate limiting (20 requests per minute)
  const rateLimitResult = await rateLimit(request, { limit: 20, window: 60 });

  // If rate limit exceeded, return the rate limit response
  if (rateLimitResult instanceof NextResponse) {
    return rateLimitResult;
  }

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
        // Save the assistant's final response to the database
        if (text) {
          const { error: assistantInsertError } = await safeQueryExecution(
            async () =>
              await supabase.from("chat_messages").insert({
                chat_id: chatId,
                role: "assistant",
                content: text,
              }),
            { fallbackData: null }
          );
          if (assistantInsertError) {
            console.error("Error saving assistant message:", assistantInsertError);
            // Optionally: handle this error (e.g., alert, retry, etc.)
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
      typeof rateLimitResult === "object" &&
      rateLimitResult !== null &&
      typeof (rateLimitResult as Headers).forEach === "function"
    ) {
      (rateLimitResult as Headers).forEach((value: string, key: string) => {
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
