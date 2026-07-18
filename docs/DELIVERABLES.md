# Project Pamoja - Deliverables

## (1) Agent Schema Definitions
The shared schema contract guarantees that all agents output data in a consistent format:
\`\`\`typescript
export interface AgentRecommendation {
  actionId: string;
  actionType: string;
  description: string;
  requiresHumanApproval: boolean;
  targetApprovers: string[];
}

export interface AgentOutput {
  agentId: string;
  timestamp: string;
  confidenceScore: number;
  priority: 'Low' | 'Medium' | 'High';
  domainMetadata: Record<string, any>;
  recommendations: AgentRecommendation[];
}
\`\`\`

## (2) Orchestration Logic & State Machine
The \`startOrchestrator()\` function in \`server/orchestration.ts\` drives a 5-second asynchronous event loop.
- **Execution**: Agents 1-4 execute in parallel via \`Promise.all()\`.
- **Conflict Resolution**: Agent 5 evaluates results by filtering out confidence scores < 0.5. It then sorts actions deterministically by \`Priority\` (which maps inherently to Safety > Accessibility > Flow > Convenience).
- **Escalation**: Any \`High\` priority recommendation requiring approval is sent to the \`pendingApprovals\` array with a domain-specific timeout. Once the timeout reaches \`timeoutAt\`, the action auto-escalates to \`Venue Operations Manager\`. If a secondary timeout passes, it falls back to \`AUTO_EXECUTED\`.

## (3) Mock Data Generator Spec
Located in \`updateMockData()\`:
- \`zoneDensity\`: 8 zones (A-H), fluctuating between 0 and 5+ ppl/m^2. >4 triggers CROWD agent.
- \`transitETA\`: Varies in minutes. >20 triggers TRANSPORT agent.
- \`accessibilityRequests\`: Int counter. >5 triggers ACCESSIBILITY agent.
- \`activeIncidents\`: Injected via UI (e.g. Blocked Corridor), triggers NAVIGATION agent.

## (4) Dashboard Component Structure
- \`<LandingView>\`: 3-icon role selector.
- \`<OrganizerDashboard>\`: Renders KPIs, a \`zoneDensity\` heatmap mapped to semantic colors (green/amber/red), and a high-level approval queue.
- \`<VenueStaffDashboard>\`: Renders an incident injection tool and the \`Venue Operations Manager\` approval queue.
- \`<VolunteerDashboard>\`: Read-only, phone-first UI mapping tasks and accessibility routing instructions.

## (5) Deployment Architecture Diagram
\`\`\`text
[ End Users (Web/Mobile) ]
       | (HTTPS / SSE)
[ NGINX Reverse Proxy ]
       |
[ Node.js / Express Server (Port 3000) ]
  ├── /api/stream (SSE for real-time push)
  ├── /api/approvals (REST for HITL)
  └── Orchestrator Loop (Background)
       ├── Mock Data Generator
       ├── Agents (Nav, Crowd, Acc, Trans)
       └── Decision Support Agent (Logic)
\`\`\`

## (6) Security Controls List
1. **Least-Privilege**: Domains only see their specific queues.
2. **Server-Auth**: Approvals are verified on the backend (simulated in demo).
3. **Data Encapsulation**: Shared state is not directly mutable by clients, only via controlled \`/api/approvals\` endpoints.

## (7) Test Scenario Scripts
- **Normal Flow**: Let system run idle, verify UI stays green.
- **Crowd Surge**: Inject density > 4 in \`mockData.ts\`, verify "Safety & Security Lead" receives an approval item.
- **Blocked Route**: Use Venue Staff view to inject "BLOCKED_CORRIDOR", verify Volunteer view updates.
- **Escalation**: Ignore a pending item for 60 seconds, verify it routes to "Venue Operations Manager".

## (8) Refactor Summary
- **Schema Extraction**: Consolidated the 5 agent output formats into a single \`AgentOutput\` interface in \`/src/types.ts\`.
- **UI Consolidation**: Centralized typography and color semantics into Tailwind utility classes in a single Layout wrapper.
- **Orchestrator Clean-up**: Moved the timeout checking and mock data generation into dedicated helper functions to keep the core loop readable and fast.
