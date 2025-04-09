"use server"

import { db } from '@/lib/db'; 
import { questions, surveyResponses, topics } from '@/lib/db/schema'; 
import { eq, notInArray, desc, sql, and } from 'drizzle-orm'; 

import { revalidatePath } from 'next/cache';
import { nanoid } from 'nanoid';

// Fetch the next unanswered question for the user
export async function fetchNextQuestion({
  userId,
  topicId = null,
}: {
  userId: string; 
  topicId: string | null; 
}) {
  try {
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

    // If no question found, return success but with no question
    if (!nextQuestion) {
      return { success: true, question: null };
    }

    return { success: true, question: nextQuestion };
  } catch (err: any) {
    console.error('Error fetching next question:', err);
    return { success: false, error: 'Failed to fetch the next question' };
  }
}

// Submit a survey response
export async function submitSurveyResponse({
  userId,
  questionId,
  answer,
}: {
  userId: string; 
  questionId: number; 
  answer: any;
}) {
  try {
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
    } else if (typeof answer === 'string') {
        textValue = answer;
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

    // Revalidate relevant paths
    revalidatePath('/survey');
    revalidatePath('/explore'); 

    return { success: true, responseId };
  } catch (err: any) {
    console.error('Error submitting survey response:', err);
    return { success: false, error: 'Failed to submit your response' };
  }
}
