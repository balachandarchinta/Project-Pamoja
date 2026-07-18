# Project Pamoja - Security & Testing Guardrails

This document outlines the essential security measures and testing scenarios required to maintain the integrity and reliability of the Project Pamoja stadium operations system.

## 1. Security Guardrails

### 1.1. API & Secret Management
* **Server-Side AI Execution**: The `GEMINI_API_KEY` must never be exposed to the client. All AI capabilities (`/api/ai-insight`) are brokered strictly through the Node.js backend (`server/api.ts`).
* **Environment Variables**: Use `.env` files for local development and secure Secret Manager integration in production (e.g., Google Cloud Secret Manager).

### 1.2. Access Control & Authorization (RBAC)
* **Strict Role Segregation**: While the UI allows selecting roles (`ORGANIZER`, `VOLUNTEER`, `VENUE_STAFF`), a production environment must enforce these roles cryptographically via JWTs or session cookies.
* **Privileged Actions**: Endpoints like `/api/action` (handling incident approvals) must validate that the requester holds the `ORGANIZER` role before mutating state.

### 1.3. Input Validation & Sanitization
* **Payload Validation**: All incoming requests (POST, PUT) must be validated against a strict schema to prevent NoSQL/SQL injection and unexpected application states.
* **XSS Protection**: Ensure React cleanly escapes all user-generated content (e.g., maintenance logs, incident reports). If rendering markdown, use a sanitized parser.

### 1.4. Network & Infrastructure
* **Rate Limiting**: Protect the `/api/*` routes against DDoS and brute-force attacks by implementing IP-based rate limiting.
* **SSE Connection Limits**: Cap the maximum number of concurrent Server-Sent Event connections to prevent resource exhaustion on the Node.js server.

---

## 2. Testing Case Scenarios

### 2.1. Unit Testing (Backend & Simulation Engine)
* **Test Case: Phase Transitions**: Verify that the `updateMockData()` orchestrator correctly transitions through all 5 match phases and properly scales target attendance and zone densities.
* **Test Case: AI Fallbacks**: Mock the `GoogleGenAI` client to throw an error (e.g., 503 or quota exceeded) and verify the `/api/ai-insight` endpoint gracefully falls back to a safe default string without crashing the server.

### 2.2. Integration Testing (API & SSE)
* **Test Case: Action Approval Workflow**: 
  1. Emit an approval request to `/api/action`.
  2. Verify the server responds with 200 OK.
  3. Verify the SSE stream broadcasts the updated `pendingApprovals` list to all connected clients within 50ms.
* **Test Case: SSE Reconnection**: Force-drop the client SSE connection and verify that the `useOrchestratorStream` React hook properly negotiates a reconnection and syncs the latest state.

### 2.3. End-to-End (E2E) Testing
* **Test Case: Multi-Role Interaction**:
  1. Login as `VENUE_STAFF` and submit a new maintenance incident.
  2. Switch to the `ORGANIZER` dashboard and verify the incident appears on the high-level map.
* **Test Case: Dashboard Responsiveness**: Render the Organizer dashboard on a simulated iPad Pro viewport (common for mobile operations units) and verify all KPI charts and approval buttons remain accessible and do not overlap.
