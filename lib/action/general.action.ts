"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

export async function createFeedback(params: {
  interviewId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
}) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    // Create a placeholder feedback document first with status "processing"
    let feedbackRef;
    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    // Create a placeholder document - this allows us to redirect immediately
    await feedbackRef.set({
      interviewId,
      userId,
      status: "processing",
      createdAt: new Date().toISOString(),
    });

    // Get the document ID to return
    const newFeedbackId = feedbackRef.id;

    // Process in the background using Promise.resolve()
    // This allows the function to return before the AI processing is complete
    Promise.resolve().then(async () => {
      try {
        // Process the transcript in the background
        const formattedTranscript = transcript
          .map((sentence) => `- ${sentence.role}: ${sentence.content}\n`)
          .join("");

        // Optimize prompt for faster generation
        const { object } = await generateObject({
          model: google("gemini-2.0-flash-001", {
            // Using a flash model for speed
            structuredOutputs: false,
          }),
          schema: feedbackSchema,
          prompt: `
            You are an AI interviewer analyzing a mock interview. Evaluate the candidate concisely in these categories.
            Transcript:
            ${formattedTranscript}

            Score the candidate from 0 to 100 in these areas only:
            - **Communication Skills**: Clarity, articulation, structured responses.
            - **Technical Knowledge**: Understanding of key concepts for the role.
            - **Problem-Solving**: Ability to analyze problems and propose solutions.
            - **Cultural & Role Fit**: Alignment with company values and job role.
            - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
            `,
          system:
            "You are an efficient professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be concise but insightful.",
        });

        // Update the document with the generated feedback
        const feedback = {
          interviewId,
          userId,
          totalScore: object.totalScore,
          categoryScores: object.categoryScores,
          strengths: object.strengths,
          areasForImprovement: object.areasForImprovement,
          finalAssessment: object.finalAssessment,
          status: "completed",
          createdAt: new Date().toISOString(),
        };

        await feedbackRef.update(feedback);
      } catch (error) {
        console.error("Error generating feedback:", error);

        // If there's an error, update the document with error status
        await feedbackRef.update({
          status: "error",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });

    // Return immediately with the feedback ID
    // This is the key change that makes redirection faster
    return { success: true, feedbackId: newFeedbackId };
  } catch (error) {
    console.error("Error saving feedback:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();

  return interview.data() as Interview | null;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  const feedbackData = feedbackDoc.data();

  // Return the feedback data regardless of status
  // This allows the UI to handle different status states
  return { id: feedbackDoc.id, ...feedbackData } as Feedback;
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}
