"use server";

/**
 * @file survey.ts
 * 
 * Server actions for survey operations:
 * - Fetching the next unanswered question for a user
 * - Submitting survey responses
 * 
 * Security:
 * - Server-side authentication (Supabase)
 * - No client-side user ID handling
 * - Input validation and error handling
 * - Duplicate submission prevention
 * 
 * Performance:
 * - Redis caching for frequently accessed data
 * - Cache invalidation on data changes
 */

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import * as surveySchema from "@/lib/db/schema/surveys";
import { eq, notInArray, desc, and } from "drizzle-orm";
import { cacheQuery, createCacheKey, invalidateTags } from "@/lib/redis/client";

/**
 * Fetch the next unanswered survey question for the authenticated user.
 * 
 * @param {Object} params
 * @param {string|null} params.topicId - Optional topic ID to filter questions
 * @returns {Promise<{success: boolean, question?: any, error?: string}>}
 */
export async function fetchNextQuestion({
  topicId = null,
}: {
  topicId: string | null;
}): Promise<{ success: boolean; question?: any; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("fetchNextQuestion: Unauthorized access attempt or error.", authError);
    return { success: false, error: "Authentication required." };
  }

  const userId = user.id;

  try {
    const cacheKey = createCacheKey("nextQuestion", { userId, topicId: topicId ?? "all" });
    const userTag = `user:${userId}`;

    const cachedQuestionData = await cacheQuery(
      cacheKey,
      async () => {
        // Subquery: questions already answered by the user
        const answeredQuestionsSubquery = db
          .select({ questionId: surveySchema.surveyResponses.questionId })
          .from(surveySchema.surveyResponses)
          .where(eq(surveySchema.surveyResponses.userId, userId));

        // Main query: next unanswered question (optionally filtered by topic)
        const query = db
          .select({
            id: surveySchema.questions.id,
            text: surveySchema.questions.text,
            type: surveySchema.questions.type,
            parameters: surveySchema.questions.parameters,
            topicId: surveySchema.questions.topicId,
            topicName: surveySchema.topics.name,
          })
          .from(surveySchema.questions)
          .leftJoin(
            surveySchema.topics,
            eq(surveySchema.questions.topicId, surveySchema.topics.id)
          )
          .where(
            and(
              notInArray(surveySchema.questions.id, answeredQuestionsSubquery),
              topicId ? eq(surveySchema.questions.topicId, topicId) : undefined
            )
          )
          .orderBy(desc(surveySchema.questions.createdAt))
          .limit(1);

        const question = await query.execute();
        return question.length > 0 ? question[0] : null;
      },
      {
        ttl: 60,
        tags: [userTag],
      }
    );

    if (!cachedQuestionData) {
      return { success: true, question: null };
    }

    return { success: true, question: cachedQuestionData };
  } catch (err: any) {
    console.error("Error fetching next question:", err);
    return { success: false, error: "Failed to fetch the next question" };
  }
}

/**
 * Submit a user's response to a survey question.
 * 
 * @param {Object} params
 * @param {number} params.questionId - ID of the question being answered
 * @param {any} params.answer - The user's answer (string, number, or object)
 * @returns {Promise<{success: boolean, responseId?: string, error?: string}>}
 */
export async function submitSurveyResponse({
  questionId,
  answer,
}: {
  questionId: number;
  answer: any;
}): Promise<{ success: boolean; responseId?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("submitSurveyResponse: Unauthorized access attempt or error.", authError);
    return { success: false, error: "Authentication required." };
  }

  const userId = user.id;

  // --- Rate Limiting ---
  const { rateLimit } = await import("@/lib/redis/rate-limit");
  const logger = (await import("@/lib/utils/logger")).logger;
  const limitResult = await rateLimit(
    { userId, path: "action:submitSurveyResponse" },
    {
      limit: 50,
      window: 600,
      keyPrefix: "action:survey:submit",
      ipFallback: { enabled: false },
    }
  );
  if (limitResult?.limited) {
    logger.warn(`[RateLimit Exceeded] [submitSurveyResponse] identifierType=userId identifierValue=${userId} limit=50/600s`);
    return { success: false, error: "Rate limit exceeded. Please try again later." };
  }
  // --- End Rate Limiting ---

  try {
    // Input validation
    if (!questionId || questionId <= 0) {
      return { success: false, error: "Invalid question ID" };
    }
    if (answer === undefined || answer === null) {
      return { success: false, error: "Answer is required" };
    }

    // Verify question exists
    const questionExists = await db
      .select({ id: surveySchema.questions.id })
      .from(surveySchema.questions)
      .where(eq(surveySchema.questions.id, questionId))
      .limit(1);

    if (questionExists.length === 0) {
      return { success: false, error: "Question not found" };
    }

    // Parse answer
    let optionId: string | null = null;
    let numericValue: number | null = null;
    let textValue: string | null = null;

    if (typeof answer === "string") {
      optionId = answer;
    } else if (typeof answer === "number") {
      numericValue = answer;
    } else if (answer && typeof answer === "object") {
      if (typeof answer.optionId === "string") optionId = answer.optionId;
      if (typeof answer.value === "number") numericValue = answer.value;
      if (typeof answer.text === "string") textValue = answer.text;
    }

    // Prevent duplicate responses
    const existingResponse = await db
      .select({ id: surveySchema.surveyResponses.id })
      .from(surveySchema.surveyResponses)
      .where(
        and(
          eq(surveySchema.surveyResponses.userId, userId),
          eq(surveySchema.surveyResponses.questionId, questionId)
        )
      )
      .limit(1);

    if (existingResponse.length > 0) {
      return { success: false, error: "You have already answered this question" };
    }

    // Insert response
    const responseId = nanoid();

    // The schema may require optionId, numericValue, textValue to be string | null
    // Ensure types are correct for DB insert
    await db.insert(surveySchema.surveyResponses).values({
      id: responseId,
      userId: userId,
      questionId: questionId,
      optionId: optionId ?? null,
      numericValue: numericValue !== null ? String(numericValue) : null,
      textValue: textValue ?? null,
      source: "survey_feed",
    });

    // Invalidate cache for this user
    try {
      await invalidateTags(`user:${userId}`);
      // Optionally log cache invalidation
      // console.log(`Cache invalidated for tag: user:${userId}`);
    } catch (cacheError) {
      console.error("Failed to invalidate cache:", cacheError);
    }

    // Revalidate relevant paths
    revalidatePath("/survey");
    revalidatePath("/explore");

    return { success: true, responseId };
  } catch (err: any) {
    console.error("Error submitting survey response:", err);
    return { success: false, error: "Failed to submit your response" };
  }
}
