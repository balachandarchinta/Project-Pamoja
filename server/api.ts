import { Request, Response } from 'express';
import { state } from './schema.js';
import { broadcastState } from './sse.js';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

let ai: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is missing");
    }
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
}

export function setupApiRoutes(app: any) {
  // Action approval/rejection endpoint
  app.post('/api/approvals/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const { action, role } = req.body; // action: 'approve' | 'reject', role: the identity of approver

    // Security: in a real app, verify the role against authenticated user token
    
    const approvalItem = state.pendingApprovals.find(a => a.id === id);
    if (!approvalItem) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (action === 'approve') {
      if (!approvalItem.approvedBy.includes(role)) {
        approvalItem.approvedBy.push(role);
      }
      
      // Check if all required approvers have signed off
      const allApproved = approvalItem.targetApprovers.every(target => approvalItem.approvedBy.includes(target));
      if (allApproved) {
        approvalItem.status = 'APPROVED';
        // Mock execution
        console.log(`Executing Action: ${approvalItem.actionId}`);
      }
    } else if (action === 'reject') {
       if (!approvalItem.rejectedBy.includes(role)) {
         approvalItem.rejectedBy.push(role);
       }
       approvalItem.status = 'REJECTED';
       console.log(`Rejected Action: ${approvalItem.actionId}`);
    }

    // Clean up if it's no longer pending
    if (approvalItem.status !== 'PENDING') {
      state.recentDecisions.push({
        agentId: 'human-in-the-loop',
        timestamp: new Date().toISOString(),
        confidenceScore: 1,
        priority: approvalItem.priority,
        domainMetadata: approvalItem.domainMetadata,
        recommendations: [
          {
             actionId: approvalItem.actionId,
             actionType: approvalItem.actionType,
             description: `Human ${action} action.`,
             requiresHumanApproval: false,
             targetApprovers: []
          }
        ]
      });
      state.pendingApprovals = state.pendingApprovals.filter(a => a.id !== id);
    }

    broadcastState();
    res.json({ success: true, item: approvalItem });
  });

  app.post('/api/incidents', (req: Request, res: Response) => {
    const { type, location } = req.body;
    state.mockData.activeIncidents.push({
      id: crypto.randomUUID(),
      type,
      location,
      timestamp: Date.now()
    });
    broadcastState();
    res.json({ success: true });
  });

  app.post('/api/think', async (req: Request, res: Response) => {
    try {
      const { query, context } = req.body;
      const ai = getAiClient();
      
      const prompt = `You are a strategic orchestration assistant. Consider the following active stadium conditions:\n\n${JSON.stringify(context, null, 2)}\n\nQuery: ${query}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          systemInstruction: "Analyze the operational constraints and provide a highly rational, step-by-step resolution strategy. Use clear, objective, concise language."
        }
      });
      
      res.json({ result: response.text });
    } catch (e: any) {
      console.error("Thinking mode error:", e);
      res.status(500).json({ error: e.message });
    }
  });
}
