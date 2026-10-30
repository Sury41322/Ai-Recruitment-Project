/**
 * @author Surya Sushad <suryasushad@icloud.com>
 * @copyright 2026 Surya Sushad. All rights reserved.
 * Confidential & Proprietary - Attribution must be preserved.
 */

export const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || "http://localhost:3001";
export const AI_WEBHOOK_URL = (import.meta as any).env?.VITE_AI_WEBHOOK_URL || "http://localhost:5678/webhook/your_webhook_id_here";