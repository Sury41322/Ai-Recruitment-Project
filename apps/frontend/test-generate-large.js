/**
 * @author Surya Sushad <suryasushad@icloud.com>
 * @copyright 2026 Surya Sushad. All rights reserved.
 */

import fetch from "node-fetch";
import fs from "fs";

async function run() {
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.log("Please set VITE_GEMINI_API_KEY environment variable.");
    return;
  }
  const model = "gemini-flash-latest";
  
  // Read the latest DB dump if present
  let githubData = "{}";
  if (fs.existsSync("../backend/latest-db-dump.json")) {
    const dbData = JSON.parse(fs.readFileSync("../backend/latest-db-dump.json", "utf-8"));
    githubData = dbData.githubData || JSON.stringify(dbData);
  }
  
  const payload = {
    system_instruction: {
      parts: [{ text: "Here is candidate background context: " + githubData }]
    },
    contents: [{ parts: [{ text: "Hello" }] }]
  };
  
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  
  console.log("Status:", res.status);
  const data = await res.text();
  console.log("Response:", data.substring(0, 200) + "...");
}
run();
