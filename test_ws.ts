/**
 * @author Surya Sushad <suryasushad@icloud.com>
 * @copyright 2026 Surya Sushad. All rights reserved.
 */

import { WebSocket } from "ws";

const API_KEY = process.env.VITE_GEMINI_API_KEY;

async function testConnect(apiVersion: string, modelName: string) {
    return new Promise((resolve) => {
        const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.${apiVersion}.GenerativeService.BidiGenerateContent?key=${API_KEY}`;
        const ws = new WebSocket(url);
        
        ws.on('open', () => {
            ws.send(JSON.stringify({
                setup: {
                    model: modelName,
                    generationConfig: { responseModalities: ["AUDIO"] }
                }
            }));
        });
        
        ws.on('message', (data) => {
            console.log(`SUCCESS ${apiVersion} ${modelName}:`, data.toString().substring(0, 100));
            ws.close();
            resolve(true);
        });
        
        ws.on('close', (code, reason) => {
            if (code !== 1000) {
                console.log(`FAILED ${apiVersion} ${modelName}: Code ${code}, Reason ${reason}`);
            }
            resolve(false);
        });
        
        ws.on('error', (err) => {
            console.log(`ERROR ${apiVersion} ${modelName}:`, err.message);
            resolve(false);
        });
    });
}

async function main() {
    const models = [
        "models/gemini-2.5-flash",
        "models/gemini-2.5-flash-preview-tts",
        "models/gemini-3.1-flash-tts-preview",
        "models/gemini-2.5-pro",
        "models/gemini-3.8-flash"
    ];
    for (const model of models) {
        await testConnect("v1alpha", model);
        await testConnect("v1beta", model);
    }
}
main();
