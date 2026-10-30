/**
 * @author Surya Sushad <suryasushad@icloud.com>
 * @copyright 2026 Surya Sushad. All rights reserved.
 * Confidential & Proprietary - Lead Architect: Surya Sushad
 * Authorship and copyright must not be removed or altered under any circumstances.
 */

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { TalkingHead } from "@met4citizen/talkinghead";
import { LipsyncEn } from "@met4citizen/talkinghead/modules/lipsync-en.mjs";
import { Loader2, Bot, Sparkles, RefreshCw } from "lucide-react";

export interface AvatarViewHandle {
  speak: (text: string) => void;
  stopSpeaking: () => void;
  setMood: (mood: string) => void;
}

interface AvatarViewProps {
  isSpeaking?: boolean;
  userSpeaking?: boolean;
  avatarUrl?: string;
  className?: string;
}

export const AvatarView = forwardRef<AvatarViewHandle, AvatarViewProps>(function AvatarView(
  { isSpeaking = false, userSpeaking = false, avatarUrl = "/avatars/brunette.glb", className = "" },
  ref
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const headRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Initialize TalkingHead
  useEffect(() => {
    let isMounted = true;
    let headInstance: any = null;

    async function initAvatar() {
      if (!containerRef.current) return;
      
      // Clean up any stale canvas elements from previous renders/StrictMode
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }

      setLoading(true);
      setLoadError(null);
      setProgress(10);

      try {
        // Instantiate TalkingHead with camera locked to upper body (head to mid-torso)
        // Controls disabled so user cannot drag, pan, or rotate the avatar
        headInstance = new TalkingHead(containerRef.current, {
          cameraView: "upper",
          cameraDistance: 0,
          cameraX: 0,
          cameraY: 0,
          cameraRotateX: 0,
          cameraRotateY: 0,
          cameraRotateEnable: false, // Disables user mouse rotation
          cameraPanEnable: false,    // Disables user panning
          cameraZoomEnable: false,   // Disables user zooming
          avatarMood: "neutral",
          lipsyncModules: [],
          lipsyncLang: "en",
          modelMovementFactor: 0.4,
          avatarIdleEyeContact: 0.8,
          avatarIdleHeadMove: 0.25,
          avatarSpeakingEyeContact: 0.9,
          avatarSpeakingHeadMove: 0.45,
        });

        // Completely disable OrbitControls to keep avatar fixed in place
        if (headInstance.controls) {
          headInstance.controls.enabled = false;
          headInstance.controls.enableRotate = false;
          headInstance.controls.enablePan = false;
          headInstance.controls.enableZoom = false;
        }

        // Register pre-bundled English lipsync processor
        headInstance.lipsync["en"] = new LipsyncEn();
        headRef.current = headInstance;

        setProgress(40);

        // Load the 3D GLB Avatar
        await headInstance.showAvatar(
          {
            url: avatarUrl,
            body: "F",
            avatarMood: "neutral",
            lipsyncLang: "en",
            baseline: {
              headRotateX: -0.02,
              eyeBlinkLeft: 0.1,
              eyeBlinkRight: 0.1,
            },
          },
          (ev: any) => {
            if (ev.lengthComputable && ev.total > 0) {
              const p = Math.round(40 + (ev.loaded / ev.total) * 55);
              if (isMounted) setProgress(p);
            }
          }
        );

        if (isMounted) {
          // Lock view to upper body (head to half body) and keep it centered
          headInstance.setView("upper", {
            cameraDistance: 0,
            cameraX: 0,
            cameraY: 0,
            cameraRotateX: 0,
            cameraRotateY: 0,
          });

          if (headInstance.controls) {
            headInstance.controls.enabled = false;
          }

          setProgress(100);
          setLoading(false);
          headInstance.lookAtCamera(1000);
        }
      } catch (err: any) {
        console.error("Failed to initialize TalkingHead avatar:", err);
        if (isMounted) {
          setLoadError(err?.message || "Failed to load 3D avatar");
          setLoading(false);
        }
      }
    }

    initAvatar();

    return () => {
      isMounted = false;
      if (headInstance) {
        try {
          headInstance.dispose();
        } catch (e) {
          console.warn("Error disposing TalkingHead:", e);
        }
        headRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [avatarUrl]);

  const speakWithLipSync = (text: string) => {
    if (!headRef.current) return;
    const head = headRef.current;

    const cleanText = text.replace(/[*_#`[\]()]/g, "").trim();
    if (!cleanText) return;

    try {
      const words = cleanText.split(/\s+/).filter(Boolean);
      if (!words.length) return;

      const audioCtx = head.audioCtx;
      if (audioCtx) {
        if (audioCtx.state === "suspended") {
          audioCtx.resume();
        }

        const wtimes: number[] = [];
        const wdurations: number[] = [];
        let curTime = 0;

        for (const w of words) {
          const dur = Math.max(200, Math.min(500, w.length * 65));
          wtimes.push(curTime);
          wdurations.push(dur);
          curTime += dur + 40;
        }

        const totalSec = (curTime + 400) / 1000;
        const sampleRate = audioCtx.sampleRate || 44100;
        const silentBuffer = audioCtx.createBuffer(1, Math.ceil(totalSec * sampleRate), sampleRate);

        head.speakAudio({
          audio: silentBuffer,
          words,
          wtimes,
          wdurations,
        });
      }
    } catch (err) {
      console.warn("Avatar lip-sync speak error:", err);
    }
  };

  const stopSpeaking = () => {
    if (headRef.current) {
      try {
        headRef.current.stopSpeaking();
        headRef.current.lookAtCamera(600);
        headRef.current.setMood("neutral");
      } catch (e) {}
    }
  };

  // Expose imperative methods to parent
  useImperativeHandle(ref, () => ({
    speak: (text: string) => {
      speakWithLipSync(text);
    },
    stopSpeaking: () => {
      stopSpeaking();
    },
    setMood: (mood: string) => {
      if (headRef.current) {
        try {
          headRef.current.setMood(mood);
        } catch (e) {}
      }
    },
  }));

  // Reaction to user speaking
  useEffect(() => {
    if (!headRef.current || loading) return;
    if (userSpeaking) {
      // Look closely and listen
      headRef.current.lookAtCamera(1500);
    }
  }, [userSpeaking, loading]);

  return (
    <div className={`relative flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-slate-50/90 border border-slate-200/90 shadow-lg ${className}`}>
      {/* 3D Viewport - pointer-events-none prevents user from clicking or dragging avatar */}
      <div
        ref={containerRef}
        className="w-full h-full min-h-[380px] sm:min-h-[440px] flex items-center justify-center pointer-events-none select-none overflow-hidden [&>canvas]:block [&>canvas]:mx-auto [&>canvas]:object-contain"
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm z-20 gap-3 text-slate-700">
          <div className="relative flex items-center justify-center">
            <Loader2 className="size-10 animate-spin text-violet-600" />
            <Bot className="absolute size-5 text-violet-600" />
          </div>
          <span className="text-sm font-medium text-slate-600">
            Connecting AI Interviewer… {progress > 0 && `${progress}%`}
          </span>
          <div className="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-violet-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Fallback Error Overlay */}
      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 z-20 p-6 text-center text-rose-600 gap-2">
          <Bot className="size-12 text-rose-500" />
          <p className="text-sm font-semibold">Could not load 3D Avatar</p>
          <p className="text-xs text-slate-500 max-w-xs">{loadError}</p>
        </div>
      )}

      {/* Speaking Badge */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/95 border border-slate-200 rounded-full px-3 py-1 shadow-sm backdrop-blur-md pointer-events-none z-10">
        <span className="relative flex size-2.5">
          <span
            className={`absolute inline-flex h-full w-full rounded-full ${
              isSpeaking ? "animate-ping bg-violet-500 opacity-75" : "bg-emerald-400 opacity-50"
            }`}
          />
          <span
            className={`relative inline-flex size-2.5 rounded-full ${
              isSpeaking ? "bg-violet-600" : "bg-emerald-500"
            }`}
          />
        </span>
        <span className="text-xs font-medium text-slate-700">
          {isSpeaking ? "Interviewer speaking…" : userSpeaking ? "Listening to you…" : "Interviewer Ready"}
        </span>
      </div>
    </div>
  );
});
