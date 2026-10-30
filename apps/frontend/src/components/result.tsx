/**
 * @author Surya Sushad <suryasushad@icloud.com>
 * @copyright 2026 Surya Sushad. All rights reserved.
 * Confidential & Proprietary - Lead Architect: Surya Sushad
 * Authorship and copyright must not be removed or altered under any circumstances.
 */

import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Loader2, ArrowLeft, Star, TrendingUp, CheckCircle, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";

export function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { transcript?: string[]; interviewData?: any };

  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Immediately cancel any lingering speech synthesis from the interview session
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  useEffect(() => {
    const transcriptList = state?.transcript || [];
    if (transcriptList.length === 0) {
      setError("No interview transcript found to evaluate.");
      setLoading(false);
      return;
    }

    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const evaluateInterview = async () => {
      try {
        const configRes = await fetch("/api/config");
        const configData = await configRes.json();
        const apiKey = configData.geminiApiKey;

        if (!apiKey) {
          throw new Error("No Gemini API Key found in backend configuration.");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Use verified active Gemini models with automatic fallback
        const candidateModels = [
          "gemini-flash-latest",
          "gemini-3.5-flash",
          "gemini-flash-lite-latest",
          "gemini-3.8-flash"
        ];

        const prompt = `
          You are an expert technical recruiter evaluating an AI-conducted interview.
          Please evaluate the candidate's performance based on the following transcript.
          
          Interview Transcript:
          ${transcriptList.join("\n")}
          
          Return a strict JSON response with the following structure:
          {
            "overallScore": number (out of 100),
            "communicationScore": number (out of 100),
            "coreSubjectScore": number (out of 100),
            "summary": "Short 2 sentence summary of their performance",
            "strengths": ["strength 1", "strength 2"],
            "improvements": ["area to improve 1", "area to improve 2"]
          }
        `;

        let parsed: any = null;
        let lastError: any = null;

        for (const modelName of candidateModels) {
          try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              parsed = JSON.parse(jsonMatch[0]);
              break;
            }
          } catch (modelErr: any) {
            console.warn(`Model ${modelName} failed, trying next candidate...`, modelErr);
            lastError = modelErr;
          }
        }

        if (!parsed) {
          throw lastError || new Error("Failed to parse evaluation response.");
        }

        setEvaluation(parsed);
      } catch (err: any) {
        console.error("Evaluation Error:", err);
        setError("Failed to generate interview evaluation. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    evaluateInterview();
  }, [state]);

  if (!state) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <h2 className="text-xl font-bold">No Data Found</h2>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">

        <header className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Interview Results</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left Column: Evaluation */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Star className="size-5 text-amber-500" /> AI Evaluation
            </h2>

            {loading ? (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
                <Loader2 className="size-8 animate-spin text-emerald-500 mb-4" />
                <p>Analyzing interview and generating feedback...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100">
                {error}
              </div>
            ) : evaluation ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Score Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Overall Score */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col items-center justify-center text-center">
                    <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-emerald-50 border-4 border-emerald-100 mb-3">
                      <span className="text-2xl font-bold text-emerald-600">{evaluation.overallScore}</span>
                      <span className="text-[10px] font-semibold text-emerald-600/70 uppercase tracking-wider">/ 100</span>
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900">Overall</h3>
                  </div>

                  {/* Communication */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col items-center justify-center text-center">
                    <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-blue-50 border-4 border-blue-100 mb-3">
                      <span className="text-2xl font-bold text-blue-600">{evaluation.communicationScore}</span>
                      <span className="text-[10px] font-semibold text-blue-600/70 uppercase tracking-wider">/ 100</span>
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900">Communication</h3>
                  </div>

                  {/* Core Subject */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col items-center justify-center text-center">
                    <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-indigo-50 border-4 border-indigo-100 mb-3">
                      <span className="text-2xl font-bold text-indigo-600">{evaluation.coreSubjectScore}</span>
                      <span className="text-[10px] font-semibold text-indigo-600/70 uppercase tracking-wider">/ 100</span>
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900">Core Subject</h3>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
                  <h3 className="text-md font-bold text-zinc-900 mb-2">Summary</h3>
                  <p className="text-zinc-600 text-sm leading-relaxed">{evaluation.summary}</p>
                </div>

                {/* Strengths */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
                  <h3 className="text-md font-bold text-zinc-900 flex items-center gap-2 mb-4">
                    <CheckCircle className="size-5 text-emerald-500" /> Key Strengths
                  </h3>
                  <ul className="space-y-3">
                    {evaluation.strengths?.map((str: string, i: number) => (
                      <li key={i} className="flex gap-3 text-sm text-zinc-700">
                        <span className="mt-1.5 size-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span className="leading-relaxed">{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
                  <h3 className="text-md font-bold text-zinc-900 flex items-center gap-2 mb-4">
                    <TrendingUp className="size-5 text-amber-500" /> Areas to Improve
                  </h3>
                  <ul className="space-y-3">
                    {evaluation.improvements?.map((imp: string, i: number) => (
                      <li key={i} className="flex gap-3 text-sm text-zinc-700">
                        <span className="mt-1.5 size-1.5 rounded-full bg-amber-400 shrink-0" />
                        <span className="leading-relaxed">{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            ) : null}
          </div>

          {/* Right Column: Transcript */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MessageSquare className="size-5 text-blue-500" /> Full Transcript
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden flex flex-col h-[600px]">
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50/50">
                {state.transcript?.length === 0 ? (
                  <p className="text-zinc-400 text-sm italic">No messages recorded.</p>
                ) : (
                  state.transcript?.map((msg, i) => {
                    const isUser = msg.startsWith("You:");
                    const text = msg.replace(/^(You|AI): /, '');

                    return (
                      <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm ${isUser ? "bg-zinc-900 text-white rounded-br-none shadow-md" : "bg-white border border-zinc-200 text-zinc-800 rounded-bl-none shadow-sm"}`}>
                          <p className="leading-relaxed">{text}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}