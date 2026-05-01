import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/action/general.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/action/auth.action";
import { FeedbackStatusPoller } from "@/components/FeedbackStatusPoller";

interface CategoryScore {
  name: string;
  score: number;
  comment: string;
}

interface FeedbackData {
  status: "processing" | "completed" | "error";
  totalScore?: number;
  finalAssessment?: string;
  categoryScores?: CategoryScore[];
  strengths?: string[];
  areasForImprovement?: string[];
  createdAt?: Date;
}

interface RouteParams {
  params: {
    id: string;
  };
}

const FeedbackLoading = () => (
  <section className="section-feedback animate-pulse">
    <div className="flex flex-row justify-center mb-6">
      <div className="h-8 bg-gray-300 rounded w-3/4"></div>
    </div>
    <div className="flex flex-row justify-center mb-6">
      <div className="flex flex-row gap-5">
        <div className="h-6 bg-gray-300 rounded w-32"></div>
        <div className="h-6 bg-gray-300 rounded w-32"></div>
      </div>
    </div>
    <hr className="mb-6" />
    <div className="h-24 bg-gray-300 rounded w-full mb-6"></div>
    <div className="space-y-4 mb-6">
      <div className="h-6 bg-gray-300 rounded w-full"></div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-6 bg-gray-300 rounded w-1/3"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
        </div>
      ))}
    </div>
  </section>
);

function isFeedbackData(data: any): data is FeedbackData {
  return (
    data &&
    typeof data === "object" &&
    ["processing", "completed", "error"].includes(data.status)
  );
}

const FeedbackContent = async ({
  interviewId,
  userId,
}: {
  interviewId: string;
  userId: string;
}) => {
  const interview = await getInterviewById(interviewId);
  if (!interview) redirect("/");

  try {
    const feedbackResponse = await getFeedbackByInterviewId({
      interviewId,
      userId,
    });

    if (!isFeedbackData(feedbackResponse)) {
      throw new Error("Invalid feedback data received");
    }

    const feedback = feedbackResponse;

    if (!feedback || feedback.status === "processing") {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-lg mb-4">Feedback is still being generated...</p>
          <div className="flex items-center justify-center">
            <div className="h-3 w-3 bg-primary-200 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-3 w-3 bg-primary-200 rounded-full animate-bounce [animation-delay:-0.15s] mx-2"></div>
            <div className="h-3 w-3 bg-primary-200 rounded-full animate-bounce"></div>
          </div>
        </div>
      );
    }

    if (feedback.status === "error") {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-lg mb-4 text-red-500">
            There was an error generating your feedback.
          </p>
          <Button className="btn-primary">
            <Link
              prefetch={true}
              href={`/interview/${interviewId}`}
              className="flex w-full justify-center"
            >
              Retake Interview
            </Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-8">

        {/* ================= HEADER ================= */}
        <div
          className="text-center p-8 rounded-[32px]"
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Interview Feedback
          </h1>

          <p className="text-white/60 text-sm">
            {interview.role} Interview Analysis
          </p>

          {/* SCORE */}
          <div className="mt-6 flex justify-center items-center gap-6 flex-wrap">

            <div className="flex items-center gap-2 text-white/80">
              <Image src="/star.svg" width={20} height={20} alt="star" />
              <span className="text-sm">
                Score:
                <span className="text-blue-400 font-bold ml-1">
                  {feedback.totalScore}/100
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Image src="/calendar.svg" width={18} height={18} alt="calendar" />
              {feedback.createdAt
                ? dayjs(feedback.createdAt).format("MMM D, YYYY")
                : "N/A"}
            </div>

          </div>
        </div>

        {/* ================= FINAL ASSESSMENT ================= */}
        <div
          className="p-6 rounded-2xl text-white/80"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <p className="leading-relaxed">
            {feedback.finalAssessment}
          </p>
        </div>

        {/* ================= BREAKDOWN ================= */}
        <div className="space-y-4">
          <h2 className="text-white font-semibold text-lg">
            Breakdown
          </h2>

          {feedback.categoryScores?.map((category, index) => (
            <div
              key={index}
              className="p-5 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-white font-semibold text-sm">
                  {index + 1}. {category.name}
                </p>
                <span className="text-blue-400 font-bold text-sm">
                  {category.score}/100
                </span>
              </div>

              <p className="text-white/60 text-sm leading-relaxed">
                {category.comment}
              </p>
            </div>
          ))}
        </div>

        {/* ================= STRENGTHS ================= */}
        {feedback.strengths?.length > 0 ? (
          <div
          className="p-6 rounded-2xl"
          style={{
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.2)'
          }}
        >
          <h3 className="text-green-400 font-semibold mb-3">
            Strengths
          </h3>

          <ul className="space-y-2 text-white/80 text-sm">
            {feedback.strengths?.map((s, i) => (
              <li key={i}>• {s}</li>
            ))}
          </ul>
        </div>
        ):null}

        {/* ================= IMPROVEMENTS ================= */}
        <div
          className="p-6 rounded-2xl"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)'
          }}
        >
          <h3 className="text-red-400 font-semibold mb-3">
            Areas to Improve
          </h3>

          <ul className="space-y-2 text-white/80 text-sm">
            {feedback.areasForImprovement?.map((a, i) => (
              <li key={i}>• {a}</li>
            ))}
          </ul>
        </div>

        {/* ================= ACTION BUTTONS ================= */}
        <div className="flex gap-4 pt-4">

          <Button asChild className="flex-1 bg-white/10 hover:bg-white/20 text-white">
            <Link href="/" prefetch>
              Back to Dashboard
            </Link>
          </Button>

          <Button
            asChild
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          >
            <Link href={`/interview/${interviewId}`} prefetch>
              Retake Interview
            </Link>
          </Button>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading feedback:", error);
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg mb-4 text-red-500">
          Failed to load feedback. Please try again later.
        </p>
      </div>
    );
  }
};

export default async function FeedbackPage({ params }: RouteParams) {
  const { id } = params;
  const user = await getCurrentUser();

  if (!user?.id) redirect("/");

  return (
    <section className="section-feedback container mx-auto p-4 max-w-4xl">
      <FeedbackStatusPoller interviewId={id} userId={user.id} />
      <Suspense fallback={<FeedbackLoading />}>
        <FeedbackContent interviewId={id} userId={user.id} />
      </Suspense>
    </section>
  );
}
