import { type CoreMessage, streamText, type ToolSet } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { createClient } from "@/utils/supabase/server"
import type { NextRequest } from "next/server"
import { rateLimit } from "@/lib/redis/client"
import { safeQueryExecution } from "@/utils/supabase/error-handling"
import { NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { id: chatId } = params

  // Apply rate limiting
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
  const identifier = ip;
  const rateLimitResult = await rateLimit(identifier, 20, 60) // 20 requests per minute

  if (!rateLimitResult.success) {
    return new Response("Rate limit exceeded. Please try again later.", { status: 429 })
  }

  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Verify the chat belongs to the user with safe error handling
    const { data: chat, tableNotFound } = await safeQueryExecution<{id: string, user_id: string}>(
      async () => await supabase.from("chats").select("id, user_id").eq("id", chatId).single(),
      { fallbackData: null }
    )
    
    // Handle case where database tables don't exist yet
    if (tableNotFound) {
      return NextResponse.json(
        { error: "Database tables not set up" },
        { status: 500, statusText: "Database Error: Tables not found" }
      );
    }

    if (!chat || chat.user_id !== user.id) {
      return new Response("Not found", { status: 404 })
    }

    // Parse the request body
    const { messages } = await request.json()

    // Save the user message to the database with safe error handling
    const userMessage = messages[messages.length - 1]
    const { error: insertError, tableNotFound: messagesTableNotFound } = await safeQueryExecution(
      async () => await supabase.from("chat_messages").insert({
        chat_id: chatId,
        role: userMessage.role,
        content: userMessage.content,
      }),
      { fallbackData: null }
    )
    
    // Handle case where database tables don't exist yet
    if (messagesTableNotFound) {
      return NextResponse.json(
        { error: "Chat messages table not set up" },
        { status: 500, statusText: "Database Error: Tables not found" }
      );
    }
    
    if (insertError) {
      console.error("Error inserting user message:", insertError)
      return NextResponse.json(
        { error: "Error saving message" }, 
        { status: 500 }
      );
    }

    // Define the tools for Generative UI
    const tools: ToolSet = {
      multiple_choice_question: {
        description: "Ask a multiple choice question to gather structured opinion data",
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
              description: "The available options for the user to choose from",
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
        description: "Ask a question with a slider scale to gather numeric opinion data",
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
              description: "The available options for the user to choose from",
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
    }

    // Fetch previous messages for context with safe error handling
    const { data: previousMessages } = await safeQueryExecution<any[]>(
      async () => await supabase
        .from("chat_messages")
        .select("role, content, created_at")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true })
        .limit(10), // Limit to recent messages for context
      { fallbackData: [] }
    )

    // Format previous messages for the AI
    const contextMessages =
      previousMessages?.map((msg) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      })) || []

    // Add system message if not present
    if (!contextMessages.some((msg) => msg.role === "system")) {
      contextMessages.unshift({
        role: "system",
        content: `You are Pulse, an AI assistant for Global Pulse, a platform that gathers opinions on global topics. 
        Your goal is to engage users in meaningful conversations about important global issues, 
        and occasionally use structured questions (multiple choice, sliders, buttons) to gather specific data points.
        Be neutral, respectful, and thoughtful. Avoid political bias. Focus on understanding the user's perspective.
        Use the available tools to ask structured questions when appropriate, but maintain a natural conversation flow.`,
      })
    }

    // Combine context with the latest user message
    const allMessages = [...contextMessages, userMessage]

    // Create an OpenAI provider instance
    const openai = createOpenAI({
      // Add your OpenAI API key here
    })

    // Ask OpenAI for a streaming chat response
    const result = await streamText({
      model: openai("gpt-4o"),
      system: process.env.SYSTEM_PROMPT,
      messages: allMessages as CoreMessage[],
      tools: tools,
      maxTokens: 1000, 
      temperature: 0.7,
    })

    // Convert the response into a friendly text-stream
    return result.toDataStreamResponse(); 
  } catch (error: unknown) {
    console.error("Error processing chat request:", error)
    return new Response("An error occurred", { status: 500 })
  }
}
