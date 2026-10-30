# Backend — AI Technical Interviewer API

> **Author:** Surya Sushad ([suryasushad@icloud.com](mailto:suryasushad@icloud.com))  
> **Copyright:** © 2026 Surya Sushad. All rights reserved. Confidential & Proprietary.

## Features
- Candidate session generation (`/api/v1/pre-interview`).
- Interview session lookup and data persistence with Prisma ORM and SQLite.
- Author verification endpoint (`/api/v1/author`).

## Setup
```bash
bun install
bunx prisma db push
bun dev
```
