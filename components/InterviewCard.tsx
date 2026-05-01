import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";

import { Button } from "./ui/button";
import DisplayTechIcons from "./DisplayTechIcons";

import { cn } from "@/lib/utils";
import { getFeedbackByInterviewId } from "@/lib/action/general.action";

const InterviewCard = async ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
}: InterviewCardProps) => {
  const feedback =
    userId && interviewId
      ? await getFeedbackByInterviewId({
          interviewId,
          userId,
        })
      : null;

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

  const badgeColor =
    {
      Behavioral: "bg-light-400",
      Mixed: "bg-light-600",
      Technical: "bg-light-800",
    }[normalizedType] || "bg-light-600";

  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  return (
    <div
      className="relative w-[360px] max-sm:w-full min-h-[320px] rounded-[28px] p-6 flex flex-col justify-between overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(40px) saturate(160%)',
        WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
      }}
    >
      
      <div className="absolute -top-10 -right-10 w-[120px] h-[120px] bg-blue-500/20 blur-[80px] rounded-full pointer-events-none" />
      
      <div className="relative z-10">
        <div
          className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-xs font-bold backdrop-blur-md border"
          style={{
            background:
              normalizedType === 'Technical'
                ? 'rgba(59,130,246,0.15)'
                : normalizedType === 'Behavioral'
                ? 'rgba(34,197,94,0.15)'
                : 'rgba(168,85,247,0.15)',
            border: '1px solid rgba(255,255,255,0.08)',
            color:
              normalizedType === 'Technical'
                ? '#60A5FA'
                : normalizedType === 'Behavioral'
                ? '#4ADE80'
                : '#C084FC'
          }}
        >
          {normalizedType}
        </div>

        {/* ROLE */}
        <h3 className="mt-6 text-lg font-bold text-white tracking-tight">
          {role} Interview
        </h3>

        {/* DATE + SCORE */}
        <div className="flex items-center gap-5 mt-3 text-sm text-white/70">

          <div className="flex items-center gap-2">
            <Image src="/calendar.svg" width={18} height={18} alt="calendar" className="opacity-70" />
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center gap-2">
            <Image src="/star.svg" width={18} height={18} alt="star" className="opacity-70" />
            <span className="font-medium text-white">
              {feedback?.totalScore || "---"}/100
            </span>
          </div>

        </div>

        {/* DESCRIPTION */}
        <p className="mt-5 text-sm text-white/60 leading-relaxed line-clamp-2">
          {feedback?.finalAssessment ||
            "You haven't taken this interview yet. Take it now to improve your skills."}
        </p>

      </div>

      {/* ================= BOTTOM ================= */}
      <div className="relative z-10 flex items-center justify-between mt-6">

        <DisplayTechIcons techStack={techstack} />

        <Button
          className="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: 'linear-gradient(135deg, #0F52BA, #3B82F6)',
            boxShadow: '0 10px 25px rgba(15,82,186,0.4)'
          }}
        >
          <Link
            prefetch
            href={
              feedback
                ? `/interview/${interviewId}/feedback`
                : `/interview/${interviewId}`
            }
          >
            {feedback ? "Check Feedback" : "Start"}
          </Link>
        </Button>

      </div>

    </div>
  );
};

export default InterviewCard;
