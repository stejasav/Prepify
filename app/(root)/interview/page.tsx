import InterviewGenerator from "@/components/InterviewGenerator";
import { getCurrentUser } from "@/lib/action/auth.action";

const Page = async () => {
  const user = await getCurrentUser();

  return (
    <div className="container mx-auto pt-3">
      <h1 className="text-3xl font-bold mb-8 text-center text-white">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
          Interview Generation
        </span>
      </h1>
      <InterviewGenerator userName={user?.name!} userId={user?.id!} />
    </div>
  );
};

export default Page;
