import { Request, Response } from 'express';
import { state } from './schema.js';

const clients: Response[] = [];
const MAX_SSE_CLIENTS = 100; // As per GUARDRAILS.md (SSE Connection Limits)

export function registerSSE(app: any) {
  app.get('/api/stream', (req: Request, res: Response) => {
    if (clients.length >= MAX_SSE_CLIENTS) {
      return res.status(429).json({ error: 'Too many concurrent SSE connections.' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send initial state immediately
    res.write(`data: ${JSON.stringify(state)}\n\n`);

    clients.push(res);

    req.on('close', () => {
      const index = clients.indexOf(res);
      if (index !== -1) {
        clients.splice(index, 1);
      }
    });
  });
}

export function broadcastState() {
  const data = `data: ${JSON.stringify(state)}\n\n`;
  for (const client of clients) {
    client.write(data);
  }
}
