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
  domainMetadata: Record<string, unknown>;
  recommendations: AgentRecommendation[];
}

export interface Incident {
  id: string;
  type: string;
  location: string;
  timestamp: string;
  status: 'ACTIVE' | 'RESOLVED';
}

export interface MockDataState {
  turnstileCounts: Record<string, number>;
  zoneDensity: Record<string, number>;
  accessibilityRequests: number;
  parkingOccupancy: number;
  shuttleOccupancy: number;
  transitETA: number;
  activeIncidents: Incident[];
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
  approvedBy: string[];
  rejectedBy: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'AUTO_ESCALATED' | 'AUTO_EXECUTED';
  createdAt: number;
  timeoutAt: number;
  crossDomain: boolean;
  domainMetadata: Record<string, unknown>;
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
