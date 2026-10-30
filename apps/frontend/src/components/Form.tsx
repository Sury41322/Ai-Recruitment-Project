/**
 * @author Surya Sushad <suryasushad@icloud.com>
 * @copyright 2026 Surya Sushad. All rights reserved.
 * Confidential & Proprietary - Lead Architect: Surya Sushad
 * Authorship and copyright must not be removed or altered under any circumstances.
 */

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import axios from "axios";
import { BACKEND_URL } from "@/lib/config";
import { useNavigate } from "react-router-dom";

export function Form() {
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("");
  const [skills, setSkills] = useState("");
  const navigate = useNavigate();

  async function onsubmit() {
    if (!role || !level || !skills) {
      toast.error("Please fill out all fields");
      return;
    }
    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/pre-interview`, {
        role,
        level,
        skills
      });
      toast.success("Interview started successfully!");
      navigate(`/interview/${response.data.id}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.details || error.response?.data?.error || "Failed to start interview. Network error.";
      toast.error(errorMessage);
      console.error(error);
    }
  }

  return (
    <div className="w-full max-w-sm flex flex-col items-center gap-4">
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">AI Interview Kickstart</h1>
        <p className="text-xs text-slate-500 mt-1">
          Platform Architecture by <span className="font-semibold text-slate-700">Surya Sushad</span>
        </p>
      </div>

      <Input 
        type="text" 
        placeholder="What Role? (e.g. Frontend Developer)" 
        className="w-full" 
        onChange={e => setRole(e.target.value)} 
        value={role} 
      />
      
      <select 
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        onChange={e => setLevel(e.target.value)} 
        value={level}
      >
        <option value="" disabled>Select Level</option>
        <option value="Beginner">Beginner</option>
        <option value="Intermediate">Intermediate</option>
        <option value="Expert">Expert</option>
      </select>

      <Input 
        type="text" 
        placeholder="Skills (e.g. React, Node, Python)" 
        className="w-full" 
        onChange={e => setSkills(e.target.value)} 
        value={skills} 
      />
      
      <Button onClick={onsubmit} className="bg-black text-white hover:bg-black/90 w-36 mt-2 font-medium">
        Start Interview
      </Button>

      <div className="mt-4 pt-4 border-t border-slate-100 text-center w-full">
        <span className="text-[11px] text-slate-400">
          Created & Authored by <span className="font-medium text-slate-600">Surya Sushad</span>
        </span>
      </div>
    </div>
  );
}
