# Project Pamoja

A multi-agent GenAI system for real-time stadium operations at a FIFA World Cup 2026-class venue. Features role-based dashboards, deterministic conflict resolution, and human-in-the-loop approval routing.

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

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React (Icons)
- **Backend**: Node.js, Express, Server-Sent Events (SSE)
- **AI Integration**: Google Gen AI SDK (`@google/genai`)
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
   Copy `.env.example` to `.env` and fill in your Gemini API Key.
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```

3. Start the development server (runs both frontend and backend):
   ```bash
   npm run dev
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
- `/docs`: Additional project deliverables and architecture documentation.
