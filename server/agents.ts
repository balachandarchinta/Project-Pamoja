import { AgentOutput, MockDataState } from './schema.js';

export async function runNavigationAgent(data: MockDataState): Promise<AgentOutput | null> {
  // Mock logic: if incident blocks corridor, generate reroute recommendation
  const blockedCorridors = data.activeIncidents.filter(i => i.type === 'BLOCKED_CORRIDOR');
  
  if (blockedCorridors.length > 0) {
    return {
      agentId: 'navigation',
      timestamp: new Date().toISOString(),
      confidenceScore: 0.9,
      priority: 'High',
      domainMetadata: { blocked: blockedCorridors.map(c => c.location) },
      recommendations: [{
        actionId: `REROUTE_${crypto.randomUUID()}`,
        actionType: 'UPDATE_DIGITAL_SIGNAGE',
        description: `Reroute crowd away from blocked corridor at ${blockedCorridors[0].location}`,
        requiresHumanApproval: true,
        targetApprovers: ['Venue Operations Manager']
      }]
    };
  }
  return null;
}

export async function runCrowdAgent(data: MockDataState): Promise<AgentOutput | null> {
  // Detect HIGH density (> 4 people/m2)
  const highDensityZones = Object.entries(data.zoneDensity).filter(([zone, density]) => density > 4);
  
  if (highDensityZones.length > 0) {
    return {
      agentId: 'crowd',
      timestamp: new Date().toISOString(),
      confidenceScore: 0.95,
      priority: 'High',
      domainMetadata: { highDensityZones: highDensityZones.map(z => z[0]) },
      recommendations: [{
        actionId: `CROWD_CONTROL_${crypto.randomUUID()}`,
        actionType: 'DISPATCH_STEWARDS',
        description: `Dispatch additional stewards to Zone(s) ${highDensityZones.map(z => z[0]).join(', ')} due to critical density.`,
        requiresHumanApproval: true,
        targetApprovers: ['Safety & Security Lead']
      }]
    };
  }
  return null;
}

export async function runAccessibilityAgent(data: MockDataState): Promise<AgentOutput | null> {
  if (data.accessibilityRequests > 5) {
    return {
      agentId: 'accessibility',
      timestamp: new Date().toISOString(),
      confidenceScore: 0.85,
      priority: 'Medium',
      domainMetadata: { pendingRequests: data.accessibilityRequests },
      recommendations: [{
         actionId: `ACC_ASSIST_${crypto.randomUUID()}`,
         actionType: 'DEPLOY_WHEELCHAIR_ASSIST',
         description: `High volume of accessibility requests. Deploy backup assist teams.`,
         requiresHumanApproval: false,
         targetApprovers: []
      }]
    };
  }
  return null;
}

export async function runTransportAgent(data: MockDataState): Promise<AgentOutput | null> {
  if (data.transitETA > 20) {
    return {
      agentId: 'transportation',
      timestamp: new Date().toISOString(),
      confidenceScore: 0.88,
      priority: 'High',
      domainMetadata: { transitDelay: data.transitETA },
      recommendations: [{
        actionId: `TRANSIT_DELAY_${crypto.randomUUID()}`,
        actionType: 'HOLD_EGRESS',
        description: `Major transit delay detected (${data.transitETA} mins). Hold egress to prevent platform crowding.`,
        requiresHumanApproval: true,
        targetApprovers: ['Transport & Logistics Lead', 'Safety & Security Lead'] // Cross-domain
      }]
    };
  }
  return null;
}
