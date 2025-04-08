"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { nanoid } from "nanoid"

export async function submitSurveyResponse(formData: FormData) {
  const supabase = createClient()

  try {
    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Extract data from the form
    const questionId = formData.get("questionId") as string
    const optionId = formData.get("optionId") as string
    const value = formData.get("value") as string
    const chatId = formData.get("chatId") as string

    if (!questionId || (!optionId && !value) || !chatId) {
      return { success: false, error: "Missing required fields" }
    }

    // Create a response record
    const responseId = nanoid()
    const { error } = await supabase.from("survey_responses").insert({
      id: responseId,
      user_id: user.id,
      question_id: questionId,
      option_id: optionId || null,
      numeric_value: value ? Number.parseFloat(value) : null,
      chat_id: chatId,
    })

    if (error) {
      console.error("Error submitting survey response:", error)
      return { success: false, error: "Failed to submit response" }
    }

    // Revalidate relevant paths
    revalidatePath(`/chat/${chatId}`)
    revalidatePath("/explore")

    return { success: true, responseId }
  } catch (error) {
    console.error("Error in submitSurveyResponse:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
