import { StreamingTextResponse } from "ai"
import { createClient } from "@/lib/supabase/server"
import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { NextRequest } from "next/server"
import { rateLimit } from "@/lib/redis/client"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { id: chatId } = params

  // Apply rate limiting
  const identifier = request.ip || "anonymous"
  const rateLimitResult = await rateLimit(identifier, 20, 60) // 20 requests per minute

  if (!rateLimitResult.success) {
    return new Response("Rate limit exceeded. Please try again later.", { status: 429 })
  }

  try {
    const supabase = createClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Verify the chat belongs to the user
    const { data: chat } = await supabase.from("chats").select("id, user_id").eq("id", chatId).single()

    if (!chat || chat.user_id !== user.id) {
      return new Response("Not found", { status: 404 })
    }

    // Parse the request body
    const { messages } = await request.json()

    // Save the user message to the database
    const userMessage = messages[messages.length - 1]
    await supabase.from("chat_messages").insert({
      chat_id: chatId,
      role: userMessage.role,
      content: userMessage.content,
    })

    // Define the tools for Generative UI
    const tools = [
      {
        name: "multiple_choice_question",
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
      {
        name: "slider_scale_question",
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
      {
        name: "buttons_question",
        description: "Ask a question with button options to gather categorical opinion data",
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
    ]

    // Fetch previous messages for context
    const { data: previousMessages } = await supabase
      .from("chat_messages")
      .select("role, content, created_at")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true })
      .limit(10) // Limit to recent messages for context

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

    // Start the AI stream
    const result = await streamText({
      model: openai("gpt-4o"),
      messages: allMessages,
      tools,
      temperature: 0.7,
      max_tokens: 1000,
    })

    // Create a server-side function to handle the stream completion
    const handleStreamCompletion = async () => {
      try {
        // Consume the stream to get the full response
        const fullResponse = await result.text

        // Save the assistant's response to the database
        await supabase.from("chat_messages").insert({
          chat_id: chatId,
          role: "assistant",
          content: fullResponse,
        })

        // Update the chat title if it's a new chat (only has 2-3 messages)
        if (previousMessages && previousMessages.length <= 2) {
          // Generate a title based on the conversation
          const titleResponse = await streamText({
            model: openai("gpt-4o"),
            messages: [
              {
                role: "system",
                content:
                  "Generate a short, concise title (3-5 words) for this conversation based on the topic being discussed. Return only the title text.",
              },
              ...allMessages,
              { role: "assistant", content: fullResponse },
            ],
            temperature: 0.7,
            max_tokens: 20,
          })

          const title = await titleResponse.text

          // Update the chat title
          await supabase.from("chats").update({ title }).eq("id", chatId)
        }
      } catch (error) {
        console.error("Error in stream completion handler:", error)
      }
    }

    // Start processing the stream in the background (don't await)
    result.consumeStream().then(handleStreamCompletion)

    // Return the streaming response to the client
    return new StreamingTextResponse(result.toReadableStream())
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response("An error occurred", { status: 500 })
  }
}
