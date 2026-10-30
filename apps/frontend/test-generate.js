/**
 * @author Surya Sushad <suryasushad@icloud.com>
 * @copyright 2026 Surya Sushad. All rights reserved.
 */

import fetch from "node-fetch";

async function run() {
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.log("Please set VITE_GEMINI_API_KEY environment variable.");
    return;
  }
  const model = "gemini-flash-latest";
  
  const payload = {
    contents: [{ parts: [{ text: "Hello" }] }]
  };
  
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  
  console.log("Status:", res.status);
  const data = await res.text();
  console.log("Response:", data);
}
run();
