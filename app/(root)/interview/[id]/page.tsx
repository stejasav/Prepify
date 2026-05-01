import { getInterviewById } from "@/lib/action/general.action";
import { redirect } from "next/navigation";
import DisplayTechIcons from "@/components/DisplayTechIcons";
import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/action/auth.action";

// Define the RouteParams type properly
interface RouteParams {
  params: {
    id: string;
  };
}

const Page = async ({ params }: RouteParams) => {
  // Now params is properly typed, so we can access id directly
  const { id } = params;
  const user = await getCurrentUser();
  const interview = await getInterviewById(id);

  if (!interview) redirect("/");

  return (
  <div className="relative px-4 md:px-8 py-6">

    {/* 🔥 Glow Background */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-[-120px] left-[-120px] w-[300px] h-[300px] bg-blue-500/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-120px] right-[-120px] w-[300px] h-[300px] bg-indigo-500/20 blur-[120px] rounded-full" />
    </div>

    <div className="relative z-10 space-y-6">

      {/* HEADER */}
      <div
        className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <div className="flex items-center gap-4 flex-wrap">
          <h2 className="text-xl md:text-2xl font-bold text-white capitalize">
            {interview.role} Interview
          </h2>

          <DisplayTechIcons techStack={interview.techstack} />
        </div>

        <span
          className="px-4 py-1.5 rounded-full text-xs font-semibold"
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#60A5FA'
          }}
        >
          {interview.type}
        </span>
      </div>

      {/* AGENT */}
      <Agent
        userName={user?.name || ""}
        userId={user?.id}
        interviewId={id}
        type={interview.role}
        questions={interview.questions}
      />

    </div>
  </div>
);
};

export default Page;
