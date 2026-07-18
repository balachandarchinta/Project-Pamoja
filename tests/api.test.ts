import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { setupApiRoutes } from '../server/api.js';
import { state } from '../server/schema.js';
import * as sse from '../server/sse.js';

// Mock broadcastState to spy on it
vi.mock('../server/sse.js', () => ({
  broadcastState: vi.fn(),
  registerSSE: vi.fn()
}));

const app = express();
app.use(express.json());
setupApiRoutes(app);

describe('API & Security Integration Tests', () => {
  let organizerToken = '';

  beforeAll(async () => {
    // Get a valid JWT token
    const res = await request(app)
      .post('/api/auth')
      .send({ role: 'ORGANIZER' });
    organizerToken = res.body.token;
  });

  it('rejects /api/approvals/:id without valid JWT token', async () => {
    const res = await request(app)
      .post('/api/approvals/123')
      .send({ action: 'approve', role: 'ORGANIZER' }); 
    
    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Unauthorized');
  });

  it('validates /api/incidents payload', async () => {
    const res = await request(app)
      .post('/api/incidents')
      .send({ type: '', location: '' }); // Invalid payload per zod schema
      
    expect(res.status).toBe(400);
  });

  it('AI Fallback returns safe default when API errors out', async () => {
    const res = await request(app)
      .post('/api/think')
      .send({ query: 'help', context: {} });
      
    expect(res.status).toBe(200);
    expect(res.body.result).toContain('System fallback: AI assistant is temporarily unavailable');
  });
  
  it('successfully approves action, updates state and broadcasts to SSE', async () => {
    const testId = 'test-approval-id';
    state.pendingApprovals.push({
      id: testId,
      actionId: 'ACT-001',
      actionType: 'Evacuate',
      description: 'Test',
      sourceAgent: 'Test',
      confidenceScore: 0.9,
      priority: 'High',
      targetApprovers: ['ORGANIZER'],
      approvedBy: [],
      rejectedBy: [],
      status: 'PENDING',
      createdAt: Date.now(),
      timeoutAt: Date.now() + 60000,
      crossDomain: false,
      domainMetadata: {}
    });

    const res = await request(app)
      .post(`/api/approvals/${testId}`)
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({ action: 'approve', role: 'ORGANIZER' });

    expect(res.status).toBe(200);
    
    // Check that it was moved to recentDecisions
    const decision = state.recentDecisions.find(d => d.recommendations[0]?.actionId === 'ACT-001');
    expect(decision).toBeDefined();

    // Verify SSE stream broadcasts the updated list (GUARDRAILS requirement)
    expect(sse.broadcastState).toHaveBeenCalled();
  });
});
