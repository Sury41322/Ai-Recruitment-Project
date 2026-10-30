/**
 * @author Surya Sushad <suryasushad@icloud.com>
 * @copyright 2026 Surya Sushad. All rights reserved.
 */

import fs from "fs";
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
      }
    }
  }));
};

ws.onmessage = async (e) => {
  let text = e.data;
  if (e.data instanceof Blob) {
      text = await e.data.text();
  } else if (Buffer.isBuffer(e.data)) {
      text = e.data.toString();
  }
  console.log("Message:", text.substring(0, 100));
  const data = JSON.parse(text);
  if (data.setupComplete) {
    // Send 1 second of silent PCM audio
    const pcmData = new Int16Array(16000);
    const buffer8 = new Uint8Array(pcmData.buffer);
    let binary = '';
    for (let i = 0; i < buffer8.byteLength; i++) {
      binary += String.fromCharCode(buffer8[i]);
    }
    const base64 = btoa(binary);

    ws.send(JSON.stringify({
      realtimeInput: {
        mediaChunks: [{
          mimeType: "audio/pcm;rate=16000",
          data: base64
        }]
      }
    }));
  }
};

ws.onclose = (e) => {
  console.log("Closed:", e.code, e.reason);
};
