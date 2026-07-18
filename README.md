# Project Pamoja

A multi-agent GenAI system for real-time stadium operations at a FIFA World Cup 2026-class venue. Features role-based dashboards, deterministic conflict resolution, and human-in-the-loop approval routing.

## 🚀 Live Demo
**The application is currently deployed and serving traffic at:**
👉 [https://project-pamoja-816331510983.us-central1.run.app](https://project-pamoja-816331510983.us-central1.run.app)

## Overview

Project Pamoja provides a real-time, simulated environment for stadium operations management. It features distinct dashboards tailored to specific operational roles, all synchronized via Server-Sent Events (SSE) backed by a Node.js Express server.

### Features

- **Role-Based Workflows**: Dedicated dashboard views for:
  - `Organizer`: High-level venue overview, critical incident approvals, VIP management, and match phase tracking.
  - `Volunteer`: Localized task views, visitor assistance routing, and direct communication.
  - `Venue Staff`: Maintenance logging, security sweep updates, and crowd control management.
- **Dynamic Simulation Engine**: The backend naturally advances through realistic match phases (Pre-Match, First Half, Halftime Break, Second Half, Post-Match). Key Performance Indicators (KPIs) like zone density, shuttle occupancy, and total attendance automatically fluctuate according to the current phase.
- **Human-in-the-loop Approvals**: Critical incidents generate tasks that require manual organizer sign-off.
- **AI-Ready Architecture**: Integrated with the `@google/genai` SDK for predictive traffic analysis, automated incident classification, and smart volunteer dispatch.
- **Production-Grade Security**: 
  - Real cryptographic role verification via JSON Web Tokens (JWT).
  - API rate-limiting via `express-rate-limit` and HTTP header protections via `helmet`.
  - Strong schema validation via `zod` and XSS protection via the `xss` library.
  - Server-Sent Event (SSE) connection limiting and robust client reconnection polling.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React (Icons)
- **Backend**: Node.js, Express, Server-Sent Events (SSE)
- **AI Integration**: Google Gen AI SDK (`@google/genai`)
- **Testing**: Vitest, React Testing Library, JSDOM
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js (v18+)
- A Gemini API Key (for AI features)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Copy `.env.example` to `.env` and fill in your Gemini API Key. (The JWT Secret will fallback to a dev key automatically, but you can set `JWT_SECRET` for production).
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```

3. Start the development server (runs both frontend and backend):
   ```bash
   npm run dev
   ```

### Running Tests
The project features a full testing suite encompassing unit tests, API integration tests, and simulated multi-role E2E tests:
```bash
npm run test
# Or to run via vitest explicitly:
npx vitest run
```

### Production Build

To compile the application for production:
```bash
npm run build
npm start
```

## Structure

- `/src`: Frontend React application.
  - `/src/components`: UI components and Role Dashboards.
  - `/src/hooks`: Custom React hooks (e.g., `useOrchestratorStream` for SSE).
- `/server`: Node.js Express backend.
  - `/server/orchestration.ts`: The simulation engine that updates attendance and match phases.
  - `/server/sse.ts`: Server-Sent Events management.
  - `/server/api.ts`: REST endpoints for approvals and AI actions.
- `/tests`: Testing suite for backend integration and frontend components.
- `/docs`: Additional project deliverables and architecture documentation.
- `CHANGELOG.md`: Details of latest security and production-hardening releases.
