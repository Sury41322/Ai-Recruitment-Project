/**
 * @author Surya Sushad <suryasushad@icloud.com>
 * @copyright 2026 Surya Sushad. All rights reserved.
 * Confidential & Proprietary - Lead Architect: Surya Sushad
 * Authorship and copyright must not be removed or altered under any circumstances.
 */

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { BACKEND_URL } from "@/lib/config";
import { useGeminiLive } from "@/lib/useGeminiLive";
import { Button } from "./ui/button";
import { useParams, useNavigate } from "react-router-dom";
import { AvatarView, type AvatarViewHandle } from "./AvatarView";
import { PhoneOff, Loader2, Mic } from "lucide-react";

export function Interview() {
  const { id: interviewId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [interviewData, setInterviewData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPushingToTalk, setIsPushingToTalk] = useState(false);
  
  const avatarRef = useRef<AvatarViewHandle>(null);

  const { isConnected, transcript, userLevel, aiLevel, connect, disconnect, setPushToTalk, getTranscript } = useGeminiLive(
    interviewId || null,
    {
      onAiSpeak: (text: string) => {
        avatarRef.current?.speak(text);
      },
      onAiStop: () => {
        avatarRef.current?.stopSpeaking();
      },
    }
  );

  useEffect(() => {
    return () => {
      disconnect();
      avatarRef.current?.stopSpeaking();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [disconnect]);

  useEffect(() => {
    if (setPushToTalk) {
      setPushToTalk(isPushingToTalk);
    }
  }, [isPushingToTalk, setPushToTalk]);

  useEffect(() => {
    if (!isConnected) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault(); // prevent scrolling
        setIsPushingToTalk(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsPushingToTalk(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isConnected]);

  useEffect(() => {
    if (!interviewId) return;
    
    axios.get(`${BACKEND_URL}/api/v1/interview/${interviewId}`)
      .then(res => {
        setInterviewData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [interviewId]);

  const handleStart = () => {
    if (!interviewData) return;
    
    // Construct the system instruction using the provided user profile
    const systemInstruction = `
      You are an expert technical interviewer. You are interviewing a candidate for the following position:
      
      Role: ${interviewData.role}
      Experience Level: ${interviewData.level}
      Candidate Skills: ${interviewData.skills}

      Please ask 2-3 technical questions tailored to their specific role, level, and skills. 
      Use English only during the interview.
      
      CRITICAL: Keep your responses extremely concise. Never speak more than 1 or 2 short sentences at a time. Be brief and conversational.
    `;
    
    connect(systemInstruction);
  };

  function endInterview() {
    disconnect();
    avatarRef.current?.stopSpeaking();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    const finalTranscript = getTranscript ? getTranscript() : transcript;
    navigate(`/result`, { 
      state: { 
        transcript: finalTranscript && finalTranscript.length > 0 ? finalTranscript : transcript, 
        interviewData 
      } 
    });
  }

  const aiSpeaking = aiLevel > 0.02 && aiLevel >= userLevel;
  const userSpeaking = userLevel > 0.02 && userLevel > aiLevel;

  // We must NOT auto-start, otherwise the browser will block the AudioContext from playing audio!
  // The user must explicitly click a button to begin.
  
  if (!interviewId) {
    return <div className="p-8 text-center text-slate-700">No interview session found. Please go back and submit the form.</div>;
  }

  return (
    <main className="flex h-screen w-screen flex-col overflow-hidden bg-white text-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="relative flex size-2.5">
            <span
              className={
                isConnected
                  ? "absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"
                  : "hidden"
              }
            />
            <span
              className={
                "relative inline-flex size-2.5 rounded-full " +
                (isConnected ? "bg-emerald-500" : "bg-amber-400")
              }
            />
          </span>
          <span className="text-slate-800">
            {!isConnected ? "Waiting to start…" : "Interview live"}
          </span>
          {interviewData?.role && (
            <span className="hidden sm:inline-flex items-center text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-0.5 ml-2 font-medium">
              {interviewData.role}
            </span>
          )}
        </div>

        {/* Center Architect attribution badge */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 border border-slate-200/80 rounded-full px-3 py-1 font-medium">
          <span>Architected by</span>
          <span className="font-semibold text-slate-700">Surya Sushad</span>
        </div>

        <Button
          variant="destructive"
          size="sm"
          onClick={endInterview}
          className="gap-2 rounded-full px-4 font-semibold shadow-sm"
        >
          <PhoneOff className="size-4" />
          End interview
        </Button>
      </header>

      {/* Stage */}
      <div className="flex flex-1 items-center justify-center px-6">
        {!isConnected ? (
          <div className="flex flex-col items-center gap-6 text-muted-foreground">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground">Ready for your interview?</h2>
              <p className="text-sm mt-2 max-w-md text-slate-500">
                Click the button below to connect with your AI interviewer and activate your microphone.
              </p>
            </div>
            
            <Button
              onClick={handleStart}
              disabled={loading}
              size="lg"
              className="rounded-full px-8 bg-black text-white hover:bg-black/90 font-semibold shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Loading Profile...
                </>
              ) : (
                "Start Interview"
              )}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full max-w-lg gap-4 animate-in fade-in duration-300">
            {/* Centered AI Agent 3D Avatar (half-body/upper body fixed) */}
            <AvatarView
              ref={avatarRef}
              isSpeaking={aiSpeaking}
              userSpeaking={userSpeaking}
              className="w-full h-[380px] sm:h-[440px]"
            />

            {/* Candidate mic badge */}
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-full px-4 py-1.5 shadow-sm">
              <span className="relative flex size-2">
                <span
                  className={
                    isPushingToTalk
                      ? "absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"
                      : "hidden"
                  }
                />
                <span
                  className={
                    "relative inline-flex size-2 rounded-full " +
                    (isPushingToTalk ? "bg-emerald-500" : "bg-slate-400")
                  }
                />
              </span>
              <span className="text-xs font-medium text-slate-700">
                You: {isPushingToTalk ? "Mic on (Speaking)" : "Muted"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <footer className="flex flex-col items-center justify-center px-6 py-8 gap-4">
        {isConnected && (
          <div className="flex flex-col items-center gap-2">
            <Button
              variant={isPushingToTalk ? "default" : "secondary"}
              size="lg"
              className="gap-2 rounded-full px-8 h-16 text-lg font-semibold shadow-lg transition-all active:scale-95"
              onMouseDown={() => setIsPushingToTalk(true)}
              onMouseUp={() => setIsPushingToTalk(false)}
              onMouseLeave={() => setIsPushingToTalk(false)}
              onTouchStart={() => setIsPushingToTalk(true)}
              onTouchEnd={() => setIsPushingToTalk(false)}
            >
              <Mic className={`size-6 ${isPushingToTalk ? "animate-pulse" : ""}`} />
              {isPushingToTalk ? "Listening..." : "Push to Talk"}
            </Button>
            <span className="text-xs text-muted-foreground font-medium">Hold Spacebar to talk</span>
          </div>
        )}
      </footer>
    </main>
  );
}
