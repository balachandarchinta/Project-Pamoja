import React from 'react';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';
import * as orchestration from '../src/hooks/useOrchestratorStream';
import { GlobalState } from '../src/types';

const mockState: GlobalState = {
  mockData: {
    matchPhase: 'First Half',
    activeIncidents: [],
    zoneDensity: { A: 1, B: 2, C: 1, D: 1, E: 1, F: 1, G: 1, H: 1 },
    accessibilityRequests: 0,
    transitETA: 10,
    turnstileCounts: {},
    parkingOccupancy: 0,
    shuttleOccupancy: 0
  },
  kpis: {
    totalAttendance: 50000,
    avgDensity: 1.5,
    incidentsResolved: 0
  },
  pendingApprovals: [],
  recentDecisions: []
};

vi.mock('../src/hooks/useOrchestratorStream', () => {
  return {
    useOrchestratorStream: () => ({
      state: mockState,
      lastUpdated: new Date(),
      isConnected: true,
      trendHistory: []
    })
  };
});

describe('E2E Dashboard Workflows', () => {
  const originalFetch = global.fetch;

  beforeAll(() => {
    // Mock global fetch to intercept incident reporting
    global.fetch = vi.fn(async (url, options) => {
      if (url === '/api/incidents') {
        const body = JSON.parse((options as any).body);
        mockState.mockData.activeIncidents.push({
          id: 'test-incident-123',
          type: body.type,
          location: body.location,
          timestamp: Date.now()
        });
        return {
          ok: true,
          json: async () => ({ success: true })
        } as Response;
      }
      return { ok: true, json: async () => ({}) } as Response;
    });
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('Multi-Role Interaction: Venue Staff reports incident, Organizer sees it', async () => {
    render(<App />);
    
    // 1. Select VENUE_STAFF role
    fireEvent.click(screen.getByText('Venue Staff', { selector: 'h2' }));
    
    // Wait for dashboard to load
    await screen.findByRole('heading', { name: /Active Incidents/i });

    // Submit a new maintenance incident
    fireEvent.change(screen.getByLabelText(/Incident Type/i), { target: { value: 'MEDICAL' } });
    fireEvent.change(screen.getByLabelText(/Location/i), { target: { value: 'Sector G' } });
    fireEvent.click(screen.getByText(/Report Event/i));

    // Wait for the mock fetch to execute and update state
    await waitFor(() => {
      expect(mockState.mockData.activeIncidents.length).toBe(1);
    });

    // 2. Switch to ORGANIZER role
    const select = screen.getByLabelText('Select user role');
    fireEvent.change(select, { target: { value: 'ORGANIZER' } });

    // Verify Organizer dashboard reflects the active incident
    await waitFor(() => {
      expect(screen.getByText('Current Match Phase')).toBeDefined();
      // Look for the "1" in the Active Incidents counter block
      const incidentsHeader = screen.getByText('Active Incidents');
      expect(incidentsHeader.nextElementSibling?.textContent).toBe('1');
    });
  });

  it('Dashboard Responsiveness: Organizer renders correctly on iPad Pro viewport', async () => {
    // Simulate iPad Pro portrait viewport (1024x1366)
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 1366 });
    window.dispatchEvent(new Event('resize'));

    render(<App />);
    
    // 1. Click Organizers button on landing page
    fireEvent.click(screen.getByText('Organizers', { selector: 'h2' }));

    // Verify Organizer renders correctly
    await screen.findByText('Total Attendance');

    // Verify all KPI charts and buttons render (JSDOM can't test visual overlap, but we test DOM presence)
    expect(screen.getByText('Total Attendance')).toBeDefined();
    expect(screen.getByText('Current Match Phase')).toBeDefined();
    expect(screen.getByLabelText('Key Performance Indicators')).toBeDefined();
  });
});
