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
      {/* Card container with subtle gradient */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl border border-gray-700 shadow-xl p-6 md:p-8">

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="flex items-center text-gray-300 mb-1">
              <span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>
              Interview Type
            </label>
            <select
              name="type"
              value={interviewSpec.type}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all"
              required
            >
              <option value="" disabled>
                Select interview type
              </option>
              <option value="technical">Technical</option>
              <option value="behavioral">Behavioral</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-gray-300 mb-1">
              <span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>
              Role
            </label>
            <input
              type="text"
              name="role"
              value={interviewSpec.role}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all"
              placeholder="e.g., Software Engineer"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-gray-300 mb-1">
              <span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>
              Experience Level
            </label>
            <select
              name="level"
              value={interviewSpec.level}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all"
              required
            >
              <option value="" disabled>
                Select experience level
              </option>
              <option value="Internship">Internship</option>
              <option value="Entry-level">Entry-level</option>
              <option value="Junior">Junior</option>
              <option value="Mid-level">Mid-level</option>
              <option value="Senior">Senior</option>
              <option value="Lead">Lead</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-gray-300 mb-1">
              <span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>
              Tech Stack (comma separated)
            </label>
            <input
              type="text"
              name="techstack"
              value={interviewSpec.techstack}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all"
              placeholder="e.g., JavaScript, React, Node.js"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-gray-300 mb-1">
              <span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>
              Number of Questions
            </label>
            <input
              type="number"
              name="amount"
              value={interviewSpec.amount}
              onChange={handleInputChange}
              min="3"
              max="30"
              className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all"
              placeholder="e.g., 5"
              required
            />
          </div>

          <div className="mt-10">
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium rounded-md transition-all duration-300 shadow-lg shadow-blue-900/30 flex items-center justify-center"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating...
                </>
              ) : (
                "Generate Interview"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Additional info text */}
      <div className="text-center text-gray-500 text-sm mt-4">
        Your interview questions will be generated based on these specifications
      </div>
    </div>
  );
};

export default InterviewGenerator;
