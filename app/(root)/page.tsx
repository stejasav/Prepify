import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";

import { getCurrentUser } from "@/lib/action/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/action/general.action";

// Dynamic import the InterviewCard component
// This will code-split it into a separate bundle that only loads when needed
const InterviewCard = dynamic(() => import("@/components/InterviewCard"), {
  // Show a simple loading placeholder while the component is being loaded
  loading: () => (
    <div className="bg-white rounded-lg shadow-md h-64 w-full animate-pulse" />
  ),
});

async function Home() {
  const user = await getCurrentUser();

  const [userInterviews, allInterview] = await Promise.all([
    getInterviewsByUserId(user?.id!),
    getLatestInterviews({ userId: user?.id! }),
  ]);

  const hasPastInterviews = userInterviews?.length! > 0;
  const hasUpcomingInterviews = allInterview?.length! > 0;

  return (
    <>
      <section
        className="relative flex flex-col md:flex-row items-center justify-between gap-10 p-10 rounded-[32px] overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.4)'
        }}
      >

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-[300px] h-[300px] bg-blue-500/20 blur-[120px] rounded-full" />
          <div className="absolute -bottom-20 -right-20 w-[300px] h-[300px] bg-indigo-500/20 blur-[120px] rounded-full" />
        </div>

        {/* CONTENT */}
        <div className="relative z-10 flex flex-col gap-6 max-w-lg">

          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
            Get Interview-Ready with AI-Powered Practice & Feedback
          </h2>

          <p className="text-white/70 text-base md:text-lg leading-relaxed">
            Practice real interview questions and get instant, intelligent feedback to improve faster.
          </p>

          <Button
            asChild
            className="w-fit px-6 py-5 text-white rounded-xl font-semibold text-md bg-blue-600 hover:bg-[#000926] transition-all "
          >
            <Link href="/interview" prefetch>
              Generate an Interview {" "} <span> →</span>
            </Link>
          </Button>
        </div>

        {/* IMAGE */}
        <div className="relative z-10">
          <Image
            src="/robot.png"
            alt="robo-dude"
            width={380}
            height={380}
            className="max-sm:hidden drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
          />
        </div>

      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>

        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <p>You haven&apos;t taken any interviews yet</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Take Interviews</h2>

        <div className="interviews-section">
          {hasUpcomingInterviews ? (
            allInterview?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <p>There are no interviews available</p>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;
