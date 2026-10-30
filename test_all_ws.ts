/**
 * @author Surya Sushad <suryasushad@icloud.com>
 * @copyright 2026 Surya Sushad. All rights reserved.
 */

import { WebSocket } from "ws";
import * as fs from 'fs';

const API_KEY = process.env.VITE_GEMINI_API_KEY;

async function testConnect(apiVersion: string, modelName: string): Promise<boolean> {
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
            console.log(`\n\n✅ SUCCESS ${apiVersion} ${modelName}:`, data.toString().substring(0, 100));
            ws.close();
            resolve(true);
        });
        
        ws.on('close', (code, reason) => {
            resolve(false);
        });
        
        ws.on('error', (err) => {
            resolve(false);
        });
    });
}

async function main() {
    const raw = fs.readFileSync('/tmp/models.json', 'utf8');
    const data = JSON.parse(raw);
    const models = data.models.map((m: any) => m.name);
    
    console.log(`Testing ${models.length} models...`);
    
    for (const model of models) {
        process.stdout.write(`.`);
        if (await testConnect("v1alpha", model)) return;
        if (await testConnect("v1beta", model)) return;
    }
    console.log("\nNo models supported BidiGenerateContent.");
}
main();
