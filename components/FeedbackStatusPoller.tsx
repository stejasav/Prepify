"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface FeedbackStatusPollerProps {
  interviewId: string;
  userId: string;
}

export const FeedbackStatusPoller = ({
  interviewId,
  userId,
}: FeedbackStatusPollerProps) => {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 3000);

    return () => clearInterval(interval);
  }, [interviewId, userId, router]);

  return null;
};
