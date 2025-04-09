"use server"

/**
 * Survey Actions Module
 * 
 * This module provides server actions for handling survey-related operations:
 * - Fetching the next unanswered question for a user
 * - Submitting survey responses
 * 
 * Security features:
 * - Server-side authentication using Supabase
 * - No client-side user ID handling
 * - Input validation and error handling
 * - Prevention of duplicate submissions
 * 
 * Performance optimizations:
 * - Redis caching for frequently accessed data
 * - Cache invalidation on data changes
 */

import { createClient } from "@/utils/supabase/server"; 
import { revalidatePath } from 'next/cache';
import { nanoid } from 'nanoid';
import { db } from '@/lib/db'; 
import { questions, surveyResponses, topics } from '@/lib/db/schema'; 
import { eq, notInArray, desc, sql, and } from 'drizzle-orm'; 
import { cacheQuery, createCacheKey, invalidateTags } from "@/lib/redis/client";

/**
 * Fetches the next unanswered question for the authenticated user
 * 
 * This function:
 * 1. Authenticates the user using Supabase
 * 2. Checks Redis cache for existing question data
 * 3. If not cached, queries the database for unanswered questions
 * 4. Returns the next question or null if all questions are answered
 * 
 * @param {Object} params - Function parameters
 * @param {string|null} params.topicId - Optional topic ID to filter questions by
 * @returns {Promise<{success: boolean, question?: any, error?: string}>} - Response object
 * @throws Will not throw errors, instead returns {success: false, error: string}
 */
export async function fetchNextQuestion({
  topicId = null,
}: {
  topicId: string | null; 
}) {
  // Authenticate the user
  const supabase = await createClient(); 
  const { data: { user }, error: authError } = await supabase.auth.getUser(); 

  if (authError || !user) {
    console.error("fetchNextQuestion: Unauthorized access attempt or error.", authError);
    return { success: false, error: "Authentication required." }; 
  }

  const userId = user.id; 

  try {
    // --- Caching Implementation --- 
    const cacheKey = createCacheKey('nextQuestion', { userId, topicId: topicId ?? 'all' });
    const userTag = `user:${userId}`;

    // Use cacheQuery to fetch or get cached question
    const cachedQuestionData = await cacheQuery(
      cacheKey,
      async () => {
        // --- Original Database Query Logic --- 
        // Subquery to find questions already answered by the user
        const answeredQuestionsSubquery = db
          .select({ questionId: surveyResponses.questionId })
          .from(surveyResponses)
          .where(eq(surveyResponses.userId, userId));

        // Build the query using Drizzle ORM
        let query = db
          .select({
            id: questions.id,
            text: questions.text,
            type: questions.type,
            parameters: questions.parameters,
            topicId: questions.topicId,
            topicName: topics.name, 
          })
          .from(questions)
          .leftJoin(topics, eq(questions.topicId, topics.id)) 
          .where(
            and(
              // Exclude questions the user has already answered
              notInArray(questions.id, answeredQuestionsSubquery),
              // Apply topic filter if provided
              topicId ? eq(questions.topicId, topicId) : undefined
            )
          )
          .orderBy(desc(questions.createdAt))
          .limit(1);

        const question = await query.execute(); 

        // Drizzle returns an array, even with limit(1). Get the first element or null.
        const nextQuestion = question.length > 0 ? question[0] : null;
        // --- End Original Database Query Logic ---

        // Return the data to be cached
        return nextQuestion;
      },
      {
        ttl: 60, // Cache for 60 seconds
        tags: [userTag] // Tag cache entry by user ID
      }
    );

    // If no question found (either from cache or DB), return success but with no question
    if (!cachedQuestionData) {
      return { success: true, question: null };
    }

    return { success: true, question: cachedQuestionData };
  } catch (err: any) {
    console.error('Error fetching next question:', err);
    return { success: false, error: 'Failed to fetch the next question' };
  }
}

/**
 * Submits a user's response to a survey question
 * 
 * This function:
 * 1. Authenticates the user using Supabase
 * 2. Validates the input data (question ID and answer)
 * 3. Verifies the question exists
 * 4. Checks for existing responses to prevent duplicates
 * 5. Creates a response record in the database
 * 6. Invalidates relevant caches
 * 7. Revalidates affected pages
 * 
 * @param {Object} params - Function parameters
 * @param {number} params.questionId - ID of the question being answered
 * @param {any} params.answer - The user's answer (can be string, number, or object)
 * @returns {Promise<{success: boolean, responseId?: string, error?: string}>} - Response object
 * @throws Will not throw errors, instead returns {success: false, error: string}
 */
export async function submitSurveyResponse({
  questionId,
  answer,
}: {
  questionId: number; 
  answer: any;
}) {
  // Authenticate the user
  const supabase = await createClient(); 
  const { data: { user }, error: authError } = await supabase.auth.getUser(); 

  if (authError || !user) {
    console.error("submitSurveyResponse: Unauthorized access attempt or error.", authError);
    return { success: false, error: "Authentication required." }; 
  }

  const userId = user.id; 

  try {
    // Validate the input data
    if (!questionId || questionId <= 0) {
      return { success: false, error: "Invalid question ID" };
    }

    if (answer === undefined || answer === null) {
      return { success: false, error: "Answer is required" };
    }

    // Verify the question exists
    const questionExists = await db
      .select({ id: questions.id })
      .from(questions)
      .where(eq(questions.id, questionId))
      .limit(1);

    if (questionExists.length === 0) {
      return { success: false, error: "Question not found" };
    }

    // Determine the type of answer and extract the relevant data
    let optionId: string | null = null;
    let numericValue: number | null = null;
    let textValue: string | null = null;

    if (typeof answer === 'string') {
      optionId = answer;
    } else if (typeof answer === 'number') {
      numericValue = answer;
    } else if (answer && typeof answer === 'object') {
      if (answer.optionId) optionId = answer.optionId;
      if (typeof answer.value === 'number') numericValue = answer.value;
      if (typeof answer.text === 'string') textValue = answer.text;
    }

    // Check if user has already answered this question
    const existingResponse = await db
      .select({ id: surveyResponses.id })
      .from(surveyResponses)
      .where(and(
        eq(surveyResponses.userId, userId),
        eq(surveyResponses.questionId, questionId)
      ))
      .limit(1);

    // If user has already answered, return error
    if (existingResponse.length > 0) {
      return { success: false, error: "You have already answered this question" };
    }

    // Create a response record using Drizzle
    const responseId = nanoid(); 

    await db.insert(surveyResponses).values({
      id: responseId,
      userId: userId,
      questionId: questionId,
      optionId: optionId,
      numericValue: numericValue,
      textValue: textValue,
      source: 'survey_feed',
    });

    // --- Cache Invalidation --- 
    // Invalidate the user's 'nextQuestion' cache after successful submission
    try {
      await invalidateTags(`user:${userId}`);
      console.log(`Cache invalidated for tag: user:${userId}`);
    } catch (cacheError) {
      console.error("Failed to invalidate cache:", cacheError);
      // Continue even if cache invalidation fails, main operation succeeded
    }
    // --- End Cache Invalidation ---

    // Revalidate relevant paths
    revalidatePath('/survey');
    revalidatePath('/explore'); 

    return { success: true, responseId };
  } catch (err: any) {
    console.error('Error submitting survey response:', err);
    return { success: false, error: 'Failed to submit your response' };
  }
}
