"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { nanoid } from "nanoid"

// Fetch the next unanswered question for the user
export async function fetchNextQuestion({
  userId,
  topicId = null,
}: {
  userId: string
  topicId: string | null
}) {
  const supabase = createClient()

  try {
    // Build the query to fetch questions
    let query = supabase
      .from("questions")
      .select(`
        id, 
        text, 
        type, 
        parameters,
        topic_id,
        topics(name)
      `)
      // Exclude questions the user has already answered
      .not("id", "in", (subquery) => subquery.from("survey_responses").select("question_id").eq("user_id", userId))
      .order("created_at", { ascending: false })
      .limit(1)

    // Apply topic filter if provided
    if (topicId) {
      query = query.eq("topic_id", topicId)
    }

    // Execute the query
    const { data: question, error } = await query.single()

    if (error) {
      // If no question found, return success but with no question
      if (error.code === "PGRST116") {
        return { success: true, question: null }
      }

      console.error("Error fetching next question:", error)
      return { success: false, error: "Failed to fetch the next question" }
    }

    return { success: true, question }
  } catch (err) {
    console.error("Unexpected error in fetchNextQuestion:", err)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Submit a survey response
export async function submitSurveyResponse({
  userId,
  questionId,
  answer,
}: {
  userId: string
  questionId: string
  answer: any
}) {
  const supabase = createClient()

  try {
    // Determine the type of answer and extract the relevant data
    let optionId = null
    let numericValue = null
    let textValue = null

    if (typeof answer === "string") {
      // For multiple choice or buttons
      optionId = answer
    } else if (typeof answer === "number") {
      // For slider scale
      numericValue = answer
    } else if (typeof answer === "object") {
      // For more complex answer types
      if (answer.optionId) optionId = answer.optionId
      if (answer.value) numericValue = answer.value
      if (answer.text) textValue = answer.text
    }

    // Create a response record
    const responseId = nanoid()
    const { error } = await supabase.from("survey_responses").insert({
      id: responseId,
      user_id: userId,
      question_id: questionId,
      option_id: optionId,
      numeric_value: numericValue,
      text_value: textValue,
      source: "survey_feed",
    })

    if (error) {
      console.error("Error submitting survey response:", error)
      return { success: false, error: "Failed to submit your response" }
    }

    // Revalidate relevant paths
    revalidatePath("/survey")
    revalidatePath("/explore")

    return { success: true, responseId }
  } catch (err) {
    console.error("Unexpected error in submitSurveyResponse:", err)
    return { success: false, error: "An unexpected error occurred" }
  }
}
