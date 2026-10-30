/**
 * @author Surya Sushad <suryasushad@icloud.com>
 * @copyright 2026 Surya Sushad. All rights reserved.
 */

const apiKey = process.env.VITE_GEMINI_API_KEY || "YOUR_GEMINI_API_KEY";
const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`;
const ws = new WebSocket(wsUrl);

ws.onopen = () => {
  console.log("Opened");
  ws.send(JSON.stringify({
    setup: {
      model: "models/gemini-3.8-live",
      generationConfig: {
        responseModalities: ["AUDIO"]
      },
      systemInstruction: {
        parts: [{ text: "Hello" }]
      }
    }
  }));
};

ws.onmessage = (e) => {
  console.log("Message:", e.data);
  const data = JSON.parse(e.data);
  if (data.setupComplete) {
    ws.send(JSON.stringify({
      clientContent: {
        turns: [{ role: "user", parts: [{ text: "Hi! Talk to me." }] }],
        turnComplete: true
      }
    }));
  }
};

ws.onclose = (e) => {
  console.log("Closed:", e.code, e.reason);
};

ws.onerror = (e) => {
  console.log("Error:", e);
};
