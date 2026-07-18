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

export interface MockDataState {
  turnstileCounts: Record<string, number>;
  zoneDensity: Record<string, number>; // people per m^2
  accessibilityRequests: number;
  parkingOccupancy: number; // percentage 0-100
  shuttleOccupancy: number; // percentage 0-100
  transitETA: number; // minutes
  activeIncidents: any[];
  matchPhase: string;
}

export interface ApprovalItem {
  id: string;
  actionId: string;
  actionType: string;
  description: string;
  sourceAgent: string;
  confidenceScore: number;
  priority: 'Low' | 'Medium' | 'High';
  targetApprovers: string[];
  approvedBy: string[]; // List of roles that have approved
  rejectedBy: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'AUTO_ESCALATED' | 'AUTO_EXECUTED';
  createdAt: number;
  timeoutAt: number;
  crossDomain: boolean;
  domainMetadata: Record<string, any>;
}

export interface GlobalState {
  mockData: MockDataState;
  pendingApprovals: ApprovalItem[];
  recentDecisions: AgentOutput[];
  kpis: {
    totalAttendance: number;
    avgDensity: number;
    incidentsResolved: number;
  };
}

// Global state singleton for the simulation
export const state: GlobalState = {
  mockData: {
    turnstileCounts: {},
    zoneDensity: { A: 1, B: 1.5, C: 0.8, D: 2.1, E: 3.5, F: 0.9, G: 1.1, H: 0.5 },
    accessibilityRequests: 0,
    parkingOccupancy: 30,
    shuttleOccupancy: 20,
    transitETA: 15,
    activeIncidents: [],
    matchPhase: 'Pre-Match (Gates Open)'
  },
  pendingApprovals: [],
  recentDecisions: [],
  kpis: {
    totalAttendance: 45000,
    avgDensity: 1.4,
    incidentsResolved: 12,
  }
};
