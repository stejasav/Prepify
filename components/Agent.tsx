"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/action/general.action";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
  GENERATING_FEEDBACK = "GENERATING_FEEDBACK",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

interface AgentProps {
  userName: string;
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  type?: string;
  questions?: string[];
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      if (interviewId && userId) {
        // Show feedback generation status immediately
        setCallStatus(CallStatus.GENERATING_FEEDBACK);
      } else {
        setCallStatus(CallStatus.FINISHED);
      }
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.log("Error:", error);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, [interviewId, userId]);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }
  }, [messages]);

  // Separate useEffect for handling feedback generation
  useEffect(() => {
    const handleGenerateFeedback = async () => {
      if (
        !interviewId ||
        !userId ||
        callStatus !== CallStatus.GENERATING_FEEDBACK
      ) {
        return;
      }

      console.log("Generating feedback...");

      try {
        // Pre-redirect to feedback page with loading state
        // This happens before the actual feedback is generated
        router.prefetch(`/interview/${interviewId}/feedback`);

        const { success, feedbackId: id } = await createFeedback({
          interviewId: interviewId,
          userId: userId,
          transcript: messages,
          feedbackId,
        });

        if (success && id) {
          // Actually navigate to the feedback page
          router.push(`/interview/${interviewId}/feedback`);
        } else {
          console.log("Error saving feedback");
          router.push("/");
        }
      } catch (error) {
        console.error("Error during feedback generation:", error);
        router.push("/");
      }
    };

    // Generate feedback when status changes to GENERATING_FEEDBACK
    if (callStatus === CallStatus.GENERATING_FEEDBACK) {
      handleGenerateFeedback();
    }
  }, [callStatus, messages, feedbackId, interviewId, router, userId]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    // Format questions for the interviewer
    let formattedQuestions = "";
    if (questions && questions.length > 0) {
      formattedQuestions = questions
        .map((q, index) => `${index + 1}. ${q}`)
        .join("\n");
    } else {
      formattedQuestions =
        "1. Tell me about yourself and your background.\n2. What are your key strengths and weaknesses?";
    }

    // Get the role from the parent component, default to "Software Engineer" if none provided
    const role = type || "Software Engineer";

    try {
      // Start the interview with dynamic variable values
      await vapi.start(interviewer, {
        variableValues: {
          username: userName,
          role: role,
          questions: formattedQuestions,
        },
      });
    } catch (error) {
      console.error("Error starting interview:", error);
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = () => {
    vapi.stop();
    // The status will be set in the onCallEnd event handler
  };

  return (
  <>
    <div className="call-view flex flex-col md:flex-row justify-center gap-10">
      <div
        className="card-interviewer flex flex-col items-center gap-4 p-6 rounded-[28px]"
        style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
        }}
      >
        <div className="avatar relative">
          <Image
            src="/ai-avatar.png"
            alt="profile-image"
            width={70}
            height={70}
            className="object-cover rounded-full"
          />
          {isSpeaking && (
            <span className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping" />
          )}
        </div>
        <h3 className="text-white font-semibold text-sm tracking-wide">
          AI Interviewer
        </h3>
      </div>

      <div
        className="card-border flex flex-col items-center gap-4 p-6 rounded-[28px]"
        style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
        }}
      >
        <div className="card-content flex flex-col items-center gap-3">
          <Image
            src="/user-avatar.png"
            alt="profile-image"
            width={120}
            height={120}
            className="rounded-full object-cover"
          />
          <h3 className="text-white font-semibold text-sm tracking-wide">
            {userName}
          </h3>
        </div>
      </div>
    </div>

    {messages.length > 0 && (
      <div
        className="transcript-border mt-6 p-5 rounded-2xl text-center"
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <div className="transcript">
          <p
            key={lastMessage}
            className={cn(
              "transition-opacity duration-500 opacity-0",
              "animate-fadeIn opacity-100 text-white/70 text-sm leading-relaxed"
            )}
          >
            {lastMessage}
          </p>
        </div>
      </div>
    )}

    {/* ================= BUTTON ================= */}
    <div className="w-full flex justify-center mt-8">

      {callStatus === CallStatus.ACTIVE ? (
        <button
          className="btn-disconnect cursor-pointer px-8 py-3 rounded-xl text-white font-semibold transition-all"
          style={{
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            boxShadow: '0 10px 30px rgba(239,68,68,0.4)'
          }}
          onClick={() => handleDisconnect()}
        >
          End Interview
        </button>

      ) : callStatus === CallStatus.GENERATING_FEEDBACK ? (

        <div className="flex flex-col items-center gap-3 text-white/70">
          <div className="animate-pulse font-medium">
            Generating your feedback...
          </div>

          <div className="flex items-center justify-center">
            <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s] mx-1" />
            <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" />
          </div>
        </div>

      ) : (
        <button
          className="relative btn-call px-10 py-4 rounded-xl text-white font-semibold transition-all"
          style={{
            background: 'linear-gradient(135deg, #0F52BA, #3B82F6)',
            boxShadow: '0 20px 40px rgba(15,82,186,0.4)'
          }}
          onClick={() => handleCall()}
          disabled={callStatus === CallStatus.CONNECTING}
        >
          {/* 🔥 connecting pulse */}
          <span
            className={cn(
              "absolute inset-0 rounded-xl animate-ping opacity-30 bg-blue-400",
              callStatus !== "CONNECTING" && "hidden"
            )}
          />

          <span className="relative">
            {callStatus === "INACTIVE" || callStatus === "FINISHED"
              ? "Start Interview"
              : "Connecting..."}
          </span>
        </button>
      )}
    </div>
  </>
);
};

export default Agent;
