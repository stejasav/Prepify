"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface GeneratePageProps {
  userId: string;
  userName: string;
}

const InterviewGenerator = ({ userId, userName }: GeneratePageProps) => {
  const router = useRouter();
  const [interviewSpec, setInterviewSpec] = useState({
    type: "",
    role: "",
    level: "",
    techstack: "",
    amount: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setInterviewSpec((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const response = await fetch("/api/vapi/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...interviewSpec,
          userid: userId,
        }),
      });

      const data = await response.json();

      if (data.success && data.interviewId) {
        // Redirect to home page after successful generation
        router.push("/");
      } else {
        console.error("Failed to generate interview:", data.error);
        alert("Failed to generate interview. Please try again.");
      }
    } catch (error) {
      console.error("Error generating interview:", error);
      alert(
        "An error occurred while generating the interview. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
  <div className="w-full max-w-3xl mx-auto">

    {/* GLASS CARD */}
    <div
      className="relative rounded-[28px] p-6 md:p-8 overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(40px) saturate(160%)',
        WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 30px 80px rgba(0,0,0,0.4)'
      }}
    >

      <div className="absolute -top-16 -right-16 w-[200px] h-[200px] bg-blue-500/20 blur-[100px] rounded-full" />

      <form onSubmit={handleSubmit} className="space-y-5 relative z-10">

        {/* Interview Type */}
        <div className="space-y-2">
          <label className="flex items-center text-white/70 mb-1 text-sm font-medium">
            Interview Type
          </label>
          <select
            name="type"
            value={interviewSpec.type}
            onChange={handleInputChange}
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white 
                       focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
            required
          >
            <option value="" disabled className="bg-[#0b0f1a]">Select interview type</option>
            <option value="technical" className="bg-[#0b0f1a]">Technical</option>
            <option value="behavioral" className="bg-[#0b0f1a]">Behavioral</option>
            <option value="mixed" className="bg-[#0b0f1a]">Mixed</option>
          </select>
        </div>

        {/* Role */}
        <div className="space-y-2">
          <label className="flex items-center text-white/70 mb-1 text-sm font-medium">
            
            Role
          </label>
          <input
            type="text"
            name="role"
            value={interviewSpec.role}
            onChange={handleInputChange}
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white 
                       placeholder:text-white/30 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
            placeholder="e.g., Software Engineer"
            required
          />
        </div>

        {/* Experience */}
        <div className="space-y-2">
          <label className="flex items-center text-white/70 mb-1 text-sm font-medium">
            Experience Level
          </label>
          <select
            name="level"
            value={interviewSpec.level}
            onChange={handleInputChange}
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white 
                       focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
            required
          >
            <option value="" disabled className="bg-[#0b0f1a]">Select experience level</option>
            <option className="bg-[#0b0f1a]">Internship</option>
            <option className="bg-[#0b0f1a]">Entry-level</option>
            <option className="bg-[#0b0f1a]">Junior</option>
            <option className="bg-[#0b0f1a]">Mid-level</option>
            <option className="bg-[#0b0f1a]">Senior</option>
            <option className="bg-[#0b0f1a]">Lead</option>
          </select>
        </div>

        {/* Tech stack */}
        <div className="space-y-2">
          <label className="flex items-center text-white/70 mb-1 text-sm font-medium">
            Tech Stack (comma separated)
          </label>
          <input
            type="text"
            name="techstack"
            value={interviewSpec.techstack}
            onChange={handleInputChange}
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white 
                       placeholder:text-white/30 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
            placeholder="e.g., JavaScript, React, Node.js"
            required
          />
        </div>

        {/* Questions */}
        <div className="space-y-2">
          <label className="flex items-center text-white/70 mb-1 text-sm font-medium">
            Number of Questions
          </label>
          <input
            type="number"
            name="amount"
            value={interviewSpec.amount}
            onChange={handleInputChange}
            min="3"
            max="30"
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white 
                       placeholder:text-white/30 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
            placeholder="e.g., 5"
            required
          />
        </div>

        {/* BUTTON */}
        <div className="mt-10">
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-3.5 px-4 rounded-xl font-medium text-white transition-all flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #0F52BA, #3B82F6)',
              boxShadow: '0 15px 40px rgba(15,82,186,0.4)'
            }}
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Interview"
            )}
          </button>
        </div>

      </form>
    </div>

    {/* FOOTER TEXT */}
    <div className="text-center text-white/40 text-sm mt-4">
      Your interview questions will be generated based on these specifications
    </div>

  </div>
);
};

export default InterviewGenerator;
