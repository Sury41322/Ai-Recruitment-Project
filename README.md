# AI Technical Interviewer Platform

[![Author: Surya Sushad](https://img.shields.io/badge/Author-Surya%20Sushad-indigo.svg)](https://github.com/Sury41322)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary%20%26%20Confidential-red.svg)](LICENSE)
[![Runtime: Bun](https://img.shields.io/badge/Runtime-Bun%20v1.4+-fbf0df.svg)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue.svg)](https://www.typescriptlang.org/)

> **CONFIDENTIAL COMPANY SUBMISSION**  
> **Original Author & Lead Architect:** **Surya Sushad** ([suryasushad@icloud.com](mailto:suryasushad@icloud.com))  
> **GitHub:** [@Sury41322](https://github.com/Sury41322)  
> All intellectual property, architecture, and codebase authorship rights belong to Surya Sushad. See [LICENSE](LICENSE) and [ATTRIBUTION.md](ATTRIBUTION.md).

---

## 📋 Overview

The **AI Technical Interviewer Platform** is an intelligent candidate evaluation and technical screening system. Candidates participate in an interactive, voice-driven interview with a 3D animated avatar interviewer capable of real-time speech processing, intelligent silence nudging, adaptive conversational progression, and post-interview rubric evaluation.

### ✨ Key Features
- **Interactive 3D Avatar Interviewer:** Integrated half-body 3D mesh avatar with real-time lip synchronization, natural speech delivery, and conversational gestures.
- **Push-to-Talk & Hotkey Input:** Clean push-to-talk microphone activation via spacebar or button controls with audio level monitoring.
- **Adaptive Silence & Inactivity Handling:** Automated two-stage conversational nudging if a candidate hesitates or needs time to think, with automatic transition to the next question.
- **Session & Transcript Persistence:** Full session tracking connecting candidates' technical experience and resume focus areas with their interview dialogue.
- **Automated Performance Evaluation:** Instant scoring across overall readiness, communication, and core subject knowledge with structured feedback and improvement action items powered by Gemini AI.

---

## 🏛️ Project Architecture

```
Interview-Project/
├── apps/
│   ├── frontend/             # React 19 + Vite/Bun frontend with 3D avatar & voice interaction
│   │   ├── src/
│   │   │   ├── components/   # Form, Interview stage, AvatarView, Result evaluation
│   │   │   └── lib/          # useGeminiLive conversational hook, config, audio utilities
│   │   ├── public/avatars/   # 3D GLB model assets
│   │   └── package.json
│   └── backend/              # Express 5 API service with Prisma ORM & SQLite persistence
│       ├── prisma/           # Database schema and SQLite database
│       └── index.ts          # REST endpoints for candidate sessions
├── packages/
│   ├── ui/                   # Shared UI primitives
│   ├── eslint-config/        # Monorepo linting configurations
│   └── typescript-config/    # Monorepo TypeScript configurations
├── LICENSE                   # Proprietary license & perpetual attribution covenant
├── ATTRIBUTION.md            # Authorship declaration by Surya Sushad
└── README.md                 # Project documentation
```

---

## 🚀 Quick Start & Setup

### Prerequisites
- [Bun](https://bun.sh) (v1.2+ recommended)
- Google Gemini API Key

### 1. Clone & Install Dependencies

```bash
bun install
```

### 2. Configure Environment Variables

Create `.env` inside `apps/frontend/` (see `apps/frontend/.env.example`):

```bash
cp apps/frontend/.env.example apps/frontend/.env
```

Set your configuration values:
```env
# Gemini API Key for evaluation
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# AI Agent Conversation Webhook Endpoint
VITE_AI_WEBHOOK_URL=http://localhost:5678/webhook/your_webhook_id_here

# Backend API URL
VITE_BACKEND_URL=http://localhost:3001
```

### 3. Initialize Database

```bash
cd apps/backend
bunx prisma db push
cd ../..
```

### 4. Run the Development Environment

Run both frontend and backend concurrently via Turborepo:

```bash
bun dev
```

Or run services individually:

- **Frontend:** `cd apps/frontend && bun dev` (Runs on `http://localhost:3000`)
- **Backend:** `cd apps/backend && bun dev` (Runs on `http://localhost:3001`)

---

## 🔒 Confidentiality & Authorship Covenant

This project is submitted under strict proprietary terms. In accordance with the [LICENSE](LICENSE):
- The original authorship credit of **Surya Sushad** must never be removed, obscured, or replaced under any circumstance.
- Any deployment, modification, fork, or integration of this project by the receiving company must maintain visible attribution to Surya Sushad across code headers, documentation, manifests, and interfaces.

For licensing, commercial inquiries, or full rights transfer discussions:
- **Author:** Surya Sushad
- **Email:** [suryasushad@icloud.com](mailto:suryasushad@icloud.com)
- **GitHub:** [https://github.com/Sury41322](https://github.com/Sury41322)
