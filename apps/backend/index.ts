/**
 * @author Surya Sushad <suryasushad@icloud.com>
 * @copyright 2026 Surya Sushad. All rights reserved.
 * Confidential & Proprietary - Lead Architect: Surya Sushad
 * Authorship and copyright must not be removed or altered under any circumstances.
 */

import express, { Request, Response } from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Authorship & Platform Verification Endpoint
app.get("/api/v1/author", (_req: Request, res: Response) => {
  res.status(200).json({
    platform: "AI Technical Interview Backend Engine",
    author: "Surya Sushad",
    contact: "suryasushad@icloud.com",
    github: "https://github.com/Sury41322",
    copyright: "Copyright (c) 2026 Surya Sushad. All rights reserved.",
    status: "active"
  });
});

app.post("/api/v1/pre-interview", async (req: Request, res: Response): Promise<any> => {
  const { role, level, skills } = req.body;

  if (!role || !level || !skills) {
    return res.status(400).json({ error: "Missing role, level, or skills" });
  }

  try {
    const record = await prisma.interviewRequest.create({
      data: {
        role,
        level,
        skills
      }
    });

    console.log(`Saved interview request ID: ${record.id}`);
    
    return res.status(200).json({ 
      message: "Interview started successfully and data stored.",
      id: record.id
    });
  } catch (error: any) {
    console.error("Error processing request:", error);
    return res.status(500).json({ 
      error: "Internal server error while processing data", 
      details: error?.message || String(error)
    });
  }
});

app.get("/api/v1/interview/:id", async (req: Request, res: Response): Promise<any> => {
  try {
    const record = await prisma.interviewRequest.findUnique({
      where: { id: String(req.params.id) }
    });
    if (!record) {
      return res.status(404).json({ error: "Interview not found" });
    }
    return res.status(200).json(record);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log("==================================================");
  console.log("  AI Technical Interviewer Engine");
  console.log("  Author & Lead Engineer: Surya Sushad");
  console.log("  Confidential & Proprietary (c) 2026 Surya Sushad");
  console.log(`  Server running on http://localhost:${PORT}`);
  console.log("==================================================");
});