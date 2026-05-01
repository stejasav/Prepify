import InterviewGenerator from "@/components/InterviewGenerator";
import { getCurrentUser } from "@/lib/action/auth.action";

const Page = async () => {
  const user = await getCurrentUser();

  return (
    <div className="container mx-auto pt-3">
      <h1 className="text-4xl font-bold mb-8 text-center text-white">
        <span className="text-[#DDDFFF]">
          Interview Generation
        </span>
      </h1>
      <InterviewGenerator userName={user?.name!} userId={user?.id!} />
    </div>
  );
};

export default Page;
