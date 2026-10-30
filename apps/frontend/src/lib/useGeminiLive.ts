/**
 * @author Surya Sushad <suryasushad@icloud.com>
 * @copyright 2026 Surya Sushad. All rights reserved.
 * Confidential & Proprietary - Attribution must be preserved.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { AI_WEBHOOK_URL } from "./config";

export interface UseGeminiLiveOptions {
  onAiSpeak?: (text: string) => void;
  onAiStop?: () => void;
}

export function useGeminiLive(interviewId: string | null, options?: UseGeminiLiveOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  
  const [userLevel, setUserLevel] = useState(0);
  const [aiLevel, setAiLevel] = useState(0);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const transcriptBuffer = useRef("");
  const isPushToTalkActiveRef = useRef(false);
  const isHandlingResponseRef = useRef(false);
  const systemInstructionRef = useRef("");
  const isConnectedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const transcriptRef = useRef<string[]>([]);
  
  // Options refs to avoid stale closures
  const onAiSpeakRef = useRef(options?.onAiSpeak);
  const onAiStopRef = useRef(options?.onAiStop);

  useEffect(() => {
    onAiSpeakRef.current = options?.onAiSpeak;
    onAiStopRef.current = options?.onAiStop;
  }, [options?.onAiSpeak, options?.onAiStop]);
  
  // Silence / inactivity tracking refs
  const silenceTimerRef = useRef<any>(null);
  const stageRef = useRef<number>(0); // 0 = waiting for candidate's answer, 1 = nudged
  const generateResponseRef = useRef<any>(null);

  // Configured AI agent webhook URL (configured via environment / config)
  const webhookUrl = AI_WEBHOOK_URL;

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const speakText = useCallback((text: string, onFinish?: () => void) => {
    if (!isConnectedRef.current) return;

    if (synthRef.current) {
      synthRef.current.cancel();
    }
    
    setTranscript(prev => {
      const next = [...prev, `AI: ${text}`];
      transcriptRef.current = next;
      return next;
    });
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Pick the most natural-sounding English voice available in the browser
    const voices = synthRef.current?.getVoices() || [];
    const preferredVoice = voices.find(
      v => v.lang.startsWith("en") && 
      (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Daniel") || v.name.includes("Karen"))
    ) || voices.find(v => v.lang.startsWith("en"));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      if (!isConnectedRef.current) {
        synthRef.current?.cancel();
        return;
      }
      setAiLevel(0.8);
      clearSilenceTimer();
      onAiSpeakRef.current?.(text);
    };
    
    utterance.onend = () => {
      setAiLevel(0);
      onAiStopRef.current?.();
      if (!isConnectedRef.current) return;
      if (onFinish) {
        onFinish();
      }
    };
    
    utterance.onerror = () => {
      setAiLevel(0);
      onAiStopRef.current?.();
      if (!isConnectedRef.current) return;
      if (onFinish) {
        onFinish();
      }
    };
    
    currentUtteranceRef.current = utterance;
    if (isConnectedRef.current) {
      synthRef.current?.speak(utterance);
    }
  }, [clearSilenceTimer]);

  const startSilenceTimer = useCallback((delayMs = 10000) => {
    clearSilenceTimer();
    
    if (!isConnectedRef.current) return;
    
    silenceTimerRef.current = setTimeout(() => {
      if (!isConnectedRef.current) return;
      if (isPushToTalkActiveRef.current) return;
      if (isHandlingResponseRef.current) return;
      if (synthRef.current?.speaking) return;

      if (stageRef.current === 0) {
        // Stage 1: 10 seconds of silence -> ask in a warm, human-like way
        stageRef.current = 1;
        
        const humanNudges = [
          "Take your time! No worries if you're not sure—do you know the answer to this one, or would you like to move on to the next question?",
          "No rush at all! Take a moment to think—do you know how to tackle this, or should we skip to the next question?",
          "Take your time! If you're not sure about this one, just let me know and we can move forward.",
          "No pressure at all! Do you have thoughts on this question, or would you prefer a hint or to move on?"
        ];
        
        const nudgeText: string = humanNudges[Math.floor(Math.random() * humanNudges.length)] ?? "Take your time! Whenever you're ready, let me know.";
        
        speakText(nudgeText, () => {
          if (!isConnectedRef.current) return;
          // After speaking the nudge, grant another 15s window before politely moving forward
          startSilenceTimer(15000);
        });
      } else if (stageRef.current === 1) {
        // Stage 2: Still silent after nudge -> politely advance to the next question
        stageRef.current = 0;
        const skipMessage = "No worries at all! Let's move on to the next question.";
        speakText(skipMessage, () => {
          if (!isConnectedRef.current) return;
          generateResponseRef.current?.(
            "The candidate was silent and skipped. Please ask the next technical interview question.",
            { isSystemPrompt: true }
          );
        });
      }
    }, delayMs);
  }, [clearSilenceTimer, speakText]);

  const generateResponse = async (
    userText: string,
    options?: { isSystemPrompt?: boolean }
  ) => {
    if (!isConnectedRef.current) return;
    if (isHandlingResponseRef.current) return;
    if (!userText.trim()) return;
    
    clearSilenceTimer();
    isHandlingResponseRef.current = true;
    
    if (!options?.isSystemPrompt) {
      setTranscript(prev => {
        const next = [...prev, `You: ${userText}`];
        transcriptRef.current = next;
        return next;
      });
    }
    
    // Create new AbortController for this fetch request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Call n8n webhook instead of Gemini SDK directly
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          message: userText,
          // Passing interviewId as sessionId so n8n's memory can track conversation per interview
          sessionId: interviewId || "default-session",
          instruction: systemInstructionRef.current, // Send github repo data/instructions
        }),
      });

      if (!isConnectedRef.current) return;

      if (!response.ok) {
        throw new Error(`Webhook error: ${response.statusText}`);
      }

      const data = await response.json();
      if (!isConnectedRef.current) return;
      
      // n8n's AI Agent node outputs the text in the "output" property by default
      const aiText = data.output || "I'm sorry, I didn't get a proper response.";

      speakText(aiText, () => {
        if (!isConnectedRef.current) return;
        stageRef.current = 0;
        startSilenceTimer(10000); // 10 seconds of silence timer after question
      });
    } catch (e: any) {
      if (e?.name === "AbortError" || !isConnectedRef.current) {
        return;
      }
      console.error("AI Generation Error:", e);
      if (isConnectedRef.current) {
        setTranscript(prev => {
          const next = [...prev, `System: Error connecting to AI agent.`];
          transcriptRef.current = next;
          return next;
        });
        // Give candidate time to retry
        startSilenceTimer(10000);
      }
    } finally {
      isHandlingResponseRef.current = false;
    }
  };

  generateResponseRef.current = generateResponse;

  const connect = useCallback(async (systemInstruction: string) => {
    systemInstructionRef.current = systemInstruction;
    
    synthRef.current = window.speechSynthesis;
    // Warmup synth to bypass autoplay blocks
    const warmup = new SpeechSynthesisUtterance("");
    warmup.volume = 0;
    synthRef.current.speak(warmup);
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support the Web Speech API. Please use Google Chrome or Edge.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onresult = (event: any) => {
      let current = "";
      for (let i = 0; i < event.results.length; ++i) {
        current += event.results[i][0].transcript;
      }
      transcriptBuffer.current = current;
    };

    recognition.onend = () => {
      if (!isConnectedRef.current) return;
      // When recognition actually stops, send the final accumulated text
      if (transcriptBuffer.current && transcriptBuffer.current.trim()) {
        generateResponse(transcriptBuffer.current.trim());
        transcriptBuffer.current = "";
      } else {
        // Released without speaking: resume 10-second silence timer
        if (isConnectedRef.current && !isHandlingResponseRef.current && !synthRef.current?.speaking) {
          startSilenceTimer(10000);
        }
      }
    };
    
    recognitionRef.current = recognition;
    isConnectedRef.current = true;
    setIsConnected(true);
    stageRef.current = 0;
    
    // Initial greeting
    setTimeout(() => {
      if (isConnectedRef.current) {
        generateResponse("Let's begin the interview. Can you introduce yourself?", { isSystemPrompt: true });
      }
    }, 500);
  }, [speakText, startSilenceTimer]);

  const setPushToTalk = useCallback((active: boolean) => {
    if (!isConnectedRef.current) return;
    isPushToTalkActiveRef.current = active;
    
    if (active) {
       clearSilenceTimer();
       if (synthRef.current) {
         synthRef.current.cancel();
         setAiLevel(0);
       }
       onAiStopRef.current?.();
       setUserLevel(0.8);
       transcriptBuffer.current = "";
       
       if (recognitionRef.current) {
         try { recognitionRef.current.start(); } catch(e) {}
       }
    } else {
       setUserLevel(0);
       if (recognitionRef.current) {
         try { recognitionRef.current.stop(); } catch(e) {}
       }
    }
  }, [clearSilenceTimer]);

  const disconnect = useCallback(() => {
    isConnectedRef.current = false;
    setIsConnected(false);

    // 1. Abort any active HTTP fetch immediately
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // 2. Clear timers and flags
    clearSilenceTimer();
    transcriptBuffer.current = "";
    isHandlingResponseRef.current = false;
    stageRef.current = 0;

    // 3. Reset speech level indicators
    setAiLevel(0);
    setUserLevel(0);
    onAiStopRef.current?.();

    // 4. Detach recognition listeners and stop
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    // 5. Force cancel all speech synthesis
    if (synthRef.current) {
      try { synthRef.current.cancel(); } catch (e) {}
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
  }, [clearSilenceTimer]);

  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  return {
    isConnected,
    isRecording,
    transcript,
    userLevel,
    aiLevel,
    connect,
    disconnect,
    setPushToTalk,
    getTranscript: () => transcriptRef.current
  };
}
