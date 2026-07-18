import { state, AgentOutput, ApprovalItem } from './schema.js';
import { runNavigationAgent, runCrowdAgent, runAccessibilityAgent, runTransportAgent } from './agents.js';
import { broadcastState } from './sse.js';

let interval: NodeJS.Timeout | null = null;
let cycleCount = 0;

export function startOrchestrator() {
  if (interval) return;
  interval = setInterval(runCycle, 5000);
}

export function stopOrchestrator() {
  if (interval) clearInterval(interval);
  interval = null;
}

function updateMockData() {
  cycleCount++;
  
  const phaseCycle = Math.floor(cycleCount / 6) % 5;
  const phases = ['Pre-Match (Gates Open)', 'First Half', 'Halftime Break', 'Second Half', 'Post-Match (Egress)'];
  state.mockData.matchPhase = phases[phaseCycle];

  let targetAttendance = 45000;
  let densityMultiplier = 1.0;

  switch (phaseCycle) {
    case 0: // Pre-match
      targetAttendance = 45000 + (cycleCount % 6) * 2000;
      densityMultiplier = 1.5;
      break;
    case 1: // First half
      targetAttendance = 55000;
      densityMultiplier = 0.5;
      break;
    case 2: // Halftime
      targetAttendance = 55000;
      densityMultiplier = 2.0;
      break;
    case 3: // Second half
      targetAttendance = 55000;
      densityMultiplier = 0.6;
      break;
    case 4: // Post-match
      targetAttendance = Math.max(0, 55000 - (cycleCount % 6) * 5000);
      densityMultiplier = 2.5;
      break;
  }

  state.kpis.totalAttendance = Math.floor(state.kpis.totalAttendance * 0.8 + targetAttendance * 0.2);

  // Randomly fluctuate density
  for (const zone in state.mockData.zoneDensity) {
    const baseDensity = 1.0 * densityMultiplier;
    const change = (Math.random() - 0.5) * 0.5;
    state.mockData.zoneDensity[zone] = Math.max(0, baseDensity + change);
  }

  // Remove old incidents occasionally
  if (Math.random() < 0.1 && state.mockData.activeIncidents.length > 0) {
    state.mockData.activeIncidents.shift();
  }

  // Fluctuate other stats
  state.kpis.avgDensity = Object.values(state.mockData.zoneDensity).reduce((a,b)=>a+b,0) / 8;
  state.mockData.accessibilityRequests = Math.max(0, state.mockData.accessibilityRequests + Math.floor((Math.random() - 0.2) * 3));
  state.mockData.transitETA = Math.max(5, state.mockData.transitETA + Math.floor((Math.random() - 0.5) * 5));
}

function handleTimeouts() {
  const now = Date.now();
  state.pendingApprovals.forEach(item => {
    if (item.status === 'PENDING' && now > item.timeoutAt) {
      console.log(`Timeout reached for ${item.actionId}. Auto-escalating.`);
      // Add default escalation fallback
      if (!item.targetApprovers.includes('Venue Operations Manager')) {
         item.targetApprovers.push('Venue Operations Manager');
      }
      // In a real app we might auto-execute if already escalated, but for this demo we'll auto-execute after a 2nd timeout
      if (now > item.timeoutAt + 10000) {
         item.status = 'AUTO_EXECUTED';
         console.log(`Auto-executed ${item.actionId} due to safety fallback.`);
      }
    }
  });
  
  // Clean up resolved items
  const resolved = state.pendingApprovals.filter(i => i.status !== 'PENDING');
  resolved.forEach(r => {
    state.recentDecisions.push({
      agentId: 'decision-support',
      timestamp: new Date().toISOString(),
      confidenceScore: r.confidenceScore,
      priority: r.priority,
      domainMetadata: r.domainMetadata,
      recommendations: [{
         actionId: r.actionId,
         actionType: r.actionType,
         description: `${r.status} after timeout phase.`,
         requiresHumanApproval: false,
         targetApprovers: []
      }]
    });
  });
  
  state.pendingApprovals = state.pendingApprovals.filter(i => i.status === 'PENDING');
}

async function runCycle() {
  updateMockData();
  handleTimeouts();

  // Run Agents 1-4 in parallel
  const [navResult, crowdResult, accResult, transpResult] = await Promise.all([
    runNavigationAgent(state.mockData),
    runCrowdAgent(state.mockData),
    runAccessibilityAgent(state.mockData),
    runTransportAgent(state.mockData)
  ]);

  const allOutputs = [navResult, crowdResult, accResult, transpResult].filter(Boolean) as AgentOutput[];

  // Agent 5: Decision-Support Agent
  // Deterministic conflict resolution: Safety > Accessibility > Flow-Efficiency > Convenience
  // We'll just append outputs, but filter out low confidence
  
  const validOutputs = allOutputs.filter(out => out.confidenceScore >= 0.5);
  
  // Deterministic Sorting (High priority = Safety usually, but we could map explicitly)
  validOutputs.sort((a, b) => {
    const priorityWeight: Record<string, number> = { 'High': 3, 'Medium': 2, 'Low': 1 };
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });

  validOutputs.forEach(out => {
    out.recommendations.forEach(rec => {
      if (rec.requiresHumanApproval && out.priority === 'High') {
        // Route to HITL
        // Check if it already exists to prevent duplicate spam
        const exists = state.pendingApprovals.find(p => p.description === rec.description);
        if (!exists) {
          const timeoutDurations: Record<string, number> = {
            'Safety & Security Lead': 15000,
            'Accessibility Coordinator': 30000,
            'Transport & Logistics Lead': 45000,
            'Venue Operations Manager': 60000
          };
          
          let shortestTimeout = 60000;
          rec.targetApprovers.forEach(role => {
             if (timeoutDurations[role] && timeoutDurations[role] < shortestTimeout) {
                shortestTimeout = timeoutDurations[role];
             }
          });

          state.pendingApprovals.push({
            id: crypto.randomUUID(),
            actionId: rec.actionId,
            actionType: rec.actionType,
            description: rec.description,
            sourceAgent: out.agentId,
            confidenceScore: out.confidenceScore,
            priority: out.priority,
            targetApprovers: rec.targetApprovers,
            approvedBy: [],
            rejectedBy: [],
            status: 'PENDING',
            createdAt: Date.now(),
            timeoutAt: Date.now() + shortestTimeout,
            crossDomain: rec.targetApprovers.length > 1,
            domainMetadata: out.domainMetadata
          });
        }
      } else {
        // Auto-execute
        state.recentDecisions.push(out);
      }
    });
  });

  // Keep decisions list bounded
  if (state.recentDecisions.length > 50) {
    state.recentDecisions = state.recentDecisions.slice(-50);
  }

  broadcastState();
}
