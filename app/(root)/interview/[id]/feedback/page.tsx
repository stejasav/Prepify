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
      <>
        <div className="flex flex-row justify-center">
          <h1 className="text-4xl font-semibold">
            Feedback on the Interview -{" "}
            <span className="capitalize">{interview.role}</span> Interview
          </h1>
        </div>

        <div className="flex flex-row justify-center">
          <div className="flex flex-row gap-5">
            <div className="flex flex-row gap-2 items-center">
              <Image src="/star.svg" width={22} height={22} alt="star" />
              <p>
                Overall Impression:{" "}
                <span className="text-primary-200 font-bold">
                  {feedback.totalScore}
                </span>
                /100
              </p>
            </div>

            <div className="flex flex-row gap-2">
              <Image
                src="/calendar.svg"
                width={22}
                height={22}
                alt="calendar"
              />
              <p>
                {feedback.createdAt
                  ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <hr />

        <p>{feedback.finalAssessment}</p>

        <div className="flex flex-col gap-4">
          <h2>Breakdown of the Interview:</h2>
          {feedback.categoryScores?.map((category, index) => (
            <div key={index}>
              <p className="font-bold">
                {index + 1}. {category.name} ({category.score}/100)
              </p>
              <p>{category.comment}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <h3>Strengths</h3>
          <ul className="list-disc pl-5">
            {feedback.strengths?.map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h3>Areas for Improvement</h3>
          <ul className="list-disc pl-5">
            {feedback.areasForImprovement?.map((area, index) => (
              <li key={index}>{area}</li>
            ))}
          </ul>
        </div>

        <div className="flex gap-4 mt-8">
          <Button asChild variant="secondary" className="flex-1">
            <Link href="/" prefetch={true}>
              Back to dashboard
            </Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href={`/interview/${interviewId}`} prefetch={true}>
              Retake Interview
            </Link>
          </Button>
        </div>
      </>
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
