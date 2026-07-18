import { Request, Response, NextFunction } from 'express';
import { state } from './schema.js';
import { broadcastState } from './sse.js';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { z } from 'zod';
import xss from 'xss';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development';

const ApprovalSchema = z.object({
  action: z.enum(['approve', 'reject']),
  role: z.enum(['ORGANIZER', 'VOLUNTEER', 'VENUE_STAFF', 'Venue Operations Manager'])
});

const IncidentSchema = z.object({
  type: z.string().min(1).max(100),
  location: z.string().min(1).max(100)
});

const ThinkSchema = z.object({
  query: z.string().min(1),
  context: z.any()
});

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
  // Apply Helmet for security headers
  app.use(helmet({
    contentSecurityPolicy: false, // Vite uses inline scripts in dev
  }));

  // Rate Limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/', apiLimiter);

  // Auth Endpoint to issue JWT based on role
  app.post('/api/auth', (req: Request, res: Response) => {
    const { role } = req.body;
    if (!['ORGANIZER', 'VOLUNTEER', 'VENUE_STAFF'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const token = jwt.sign({ role }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token });
  });

  // RBAC Middleware
  const requireRole = (requiredRole: string) => (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
      // Allow if exact role or if we have a broader access mapping
      if (decoded.role !== requiredRole && !(decoded.role === 'ORGANIZER')) {
        return res.status(403).json({ error: `Forbidden: requires ${requiredRole} role` });
      }
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized: token verification failed' });
    }
  };

  // Action approval/rejection endpoint
  app.post('/api/approvals/:id', requireRole('ORGANIZER'), (req: Request, res: Response) => {
    const { id } = req.params;
    
    const parsed = ApprovalSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }
    const { action, role } = parsed.data;

    const approvalItem = state.pendingApprovals.find(a => a.id === id);
    if (!approvalItem) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (action === 'approve') {
      if (!approvalItem.approvedBy.includes(role)) {
        approvalItem.approvedBy.push(role);
      }
      
      const allApproved = approvalItem.targetApprovers.every(target => approvalItem.approvedBy.includes(target));
      if (allApproved) {
        approvalItem.status = 'APPROVED';
        console.log(`Executing Action: ${approvalItem.actionId}`);
      }
    } else if (action === 'reject') {
       if (!approvalItem.rejectedBy.includes(role)) {
         approvalItem.rejectedBy.push(role);
       }
       approvalItem.status = 'REJECTED';
       console.log(`Rejected Action: ${approvalItem.actionId}`);
    }

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
    const parsed = IncidentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }
    const { type, location } = parsed.data;
    
    state.mockData.activeIncidents.push({
      id: crypto.randomUUID(),
      type: xss(type), // Sanitize input
      location: xss(location), // Sanitize input
      timestamp: Date.now()
    });
    
    broadcastState();
    res.json({ success: true });
  });

  app.post('/api/think', async (req: Request, res: Response) => {
    const parsed = ThinkSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }
    const { query, context } = parsed.data;
    
    try {
      const aiClient = getAiClient();
      const prompt = `You are a strategic orchestration assistant. Consider the following active stadium conditions:\n\n${JSON.stringify(context, null, 2)}\n\nQuery: ${xss(query)}`;
      
      const response = await aiClient.models.generateContent({
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
      // Fallback response for AI quota exceeded or 503 errors as per GUARDRAILS.md
      res.json({ result: "System fallback: AI assistant is temporarily unavailable. Please rely on manual operational procedures." });
    }
  });
}
