# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev:** `npm run dev` (uses nodemon + ts-node)
- **Build:** `npm run build` (runs `tsc`, outputs to `dist/`)
- **Start:** `npm run start` (runs compiled `dist/index.js`)
- **Production:** `pm2 startOrRestart ecosystem.config.js --update-env`

No test runner or linter is configured.

## Environment Variables

Required in `.env`: `BOT_TOKEN`, `MONGO_URI`, `API_PORT` (defaults to 3000).

## Architecture

This is a Telegram bot + REST API for Xodiyev Academy. Users register via Telegram, provide their name, phone number, and upload a payment screenshot. An admin-facing API serves the collected data.

### Two entry points, one process

`src/index.ts` boots both:
1. **Telegraf bot** (long-polling) — handles user registration flow
2. **Express API** — serves data to a frontend raffle app

### Bot state machine (`src/types/index.ts: UserState`)

Users progress through states: `WAITING_NAME` → `WAITING_PHONE` → `WAITING_PAYMENT` → `COMPLETED`. Each handler in `src/bot/handlers/` advances the state. After completion, users can still upload additional files.

Handlers are registered in `src/bot/index.ts`: `/start`, text messages, contact sharing, photo/document uploads. All bot<->user messages are logged to the user's `messages` array via `logMessage()`.

### API routes (`src/api/server.ts`)

- `GET /api/tablet/random-user` — random user who uploaded a payment file (raffle for tablet)
- `GET /api/voucher/random-user` — random user with name+phone (raffle for voucher)
- `GET /api/users?page=&limit=` — paginated user list
- `/uploads/*` — static file serving for uploaded payment screenshots

### Data layer

Single Mongoose model `UserModel` in `src/models/user.model.ts`. One `users` collection stores registration data, files metadata, chat history, and state.

Uploaded files are saved to `uploads/` as `{telegramId}_{timestamp}.{ext}` and referenced by relative path in the DB.

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) auto-deploys on push to `main`: builds TypeScript, SSHs into VPS, pulls code, runs `npm ci && npm run build`, restarts PM2. The bot must run as a single PM2 instance (long-polling mode).

## Language

Bot messages are in Uzbek.
