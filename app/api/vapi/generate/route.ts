import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getRandomInterviewCover } from "@/lib/utils";
import { db } from "@/firebase/admin";
import { NextResponse } from "next/server";

// Debug helpers
const DEBUG = process.env.NODE_ENV === "development";
const logDebug = (...args: any[]) => {
  if (DEBUG) console.log(...args);
};

export async function GET() {
  try {
    // Simple health check endpoint
    logDebug("GET /api/vapi/generate - Health check");

    // Test Firebase connection
    const collectionRef = db.collection("_test");
    const testDoc = await collectionRef.add({
      test: true,
      timestamp: new Date().toISOString(),
    });
    await testDoc.delete();

    return NextResponse.json({
      success: true,
      message: "API endpoint is healthy and Firebase connection is working",
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      { success: false, error: "API health check failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  logDebug("POST request received to /api/vapi/generate");

  try {
    // Parse request body
    const body = await request.json();
    logDebug("Request body:", body);

    const { type, role, level, techstack, amount, userid } = body;

    // Validate required fields
    if (!type || !role || !level || !techstack || !amount || !userid) {
      const missingFields = [];
      if (!type) missingFields.push("type");
      if (!role) missingFields.push("role");
      if (!level) missingFields.push("level");
      if (!techstack) missingFields.push("techstack");
      if (!amount) missingFields.push("amount");
      if (!userid) missingFields.push("userid");

      logDebug("Missing required fields:", missingFields);

      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          missingFields,
        },
        { status: 400 }
      );
    }

    // Generate interview questions
    logDebug("Generating questions with AI...");

    const prompt = `Prepare questions for a job interview.
      The job role is ${role}.
      The job experience level is ${level}.
      The tech stack used in the job is: ${techstack}.
      The focus between behavioural and technical questions should lean towards: ${type}.
      The amount of questions required is: ${amount}.
      Please return only the questions, without any additional text.
      The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
      Return the questions formatted like this:
      ["Question 1", "Question 2", "Question 3"]
      
      Thank you! <3
    `;

    const { text: rawResponse } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt,
    });

    logDebug("AI raw response received:", rawResponse);

    // Parse questions from the response
    let questions;

    try {
      // First attempt: direct JSON parsing
      questions = JSON.parse(rawResponse);
      logDebug("Questions parsed on first attempt");
    } catch (parseError) {
      logDebug(
        "Direct parsing failed, trying to extract JSON pattern",
        parseError
      );

      // Try to extract JSON array pattern
      const jsonPattern = /\[\s*"[\s\S]*?"\s*(?:,\s*"[\s\S]*?"\s*)*\]/;
      const match = rawResponse.match(jsonPattern);

      if (match) {
        try {
          questions = JSON.parse(match[0]);
          logDebug("Questions extracted from pattern");
        } catch (extractError) {
          logDebug("JSON extraction failed:", extractError);
        }
      }

      // If still no valid questions, try to parse line by line
      if (!Array.isArray(questions)) {
        logDebug("Attempting line-by-line parsing");

        const lines = rawResponse
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(
            (line) =>
              line.length > 0 &&
              !line.includes("[") &&
              !line.includes("]") &&
              !line.includes("Thank you")
          )
          .map((line) => line.replace(/^\d+[\.\)]\s*/, "").trim());

        questions = lines;
        logDebug("Questions extracted line-by-line:", questions);
      }
    }

    // Final validation
    if (!Array.isArray(questions) || questions.length === 0) {
      logDebug("Failed to parse questions from AI response");
      return NextResponse.json(
        {
          success: false,
          error: "Failed to parse questions from AI response",
          rawResponse,
        },
        { status: 500 }
      );
    }

    // Create the interview document
    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(",").map((item: string) => item.trim()),
      questions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    logDebug("Saving interview to Firestore:", interview);

    // Save to Firestore
    try {
      const docRef = await db.collection("interviews").add(interview);
      logDebug("Document saved with ID:", docRef.id);

      return NextResponse.json({
        success: true,
        interviewId: docRef.id,
      });
    } catch (firestoreError: any) {
      console.error("Error saving to Firestore:", firestoreError);

      // Check for specific error types
      if (firestoreError.code === "permission-denied") {
        return NextResponse.json(
          {
            success: false,
            error:
              "Permission denied when writing to Firestore. Check security rules.",
            code: firestoreError.code,
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Database error",
          message: firestoreError.message || "Unknown Firestore error",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in POST handler:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Server error",
        message: error.message || "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
