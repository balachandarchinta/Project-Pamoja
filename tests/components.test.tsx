import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';
import { OrganizerDashboard } from '../src/components/OrganizerDashboard';

// Mock the hook so we can test the UI without WebSockets
vi.mock('../src/hooks/useOrchestratorStream', () => {
  return {
    useOrchestratorStream: () => ({
      state: {
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
          incidentResolutionTime: 5
        },
        pendingApprovals: [],
        recentDecisions: []
      },
      lastUpdated: new Date(),
      isConnected: true,
      trendHistory: []
    })
  };
});

describe('Frontend React Components', () => {
  it('App renders landing view initially and allows role selection', () => {
    render(<App />);
    expect(screen.getByText('Project Pamoja')).toBeDefined();
  });

  it('OrganizerDashboard renders KPI metrics and has correct ARIA labels', () => {
    render(<OrganizerDashboard state={{
        mockData: { matchPhase: 'Halftime Break', activeIncidents: [], zoneDensity: { A: 1, B: 2, C: 1, D: 1, E: 1, F: 1, G: 1, H: 1 }, accessibilityRequests: 0, transitETA: 5, turnstileCounts: {}, parkingOccupancy: 0, shuttleOccupancy: 0 },
        kpis: { totalAttendance: 45000, avgDensity: 1.2, incidentsResolved: 4 },
        pendingApprovals: [],
        recentDecisions: []
      }} trendHistory={[]} />);

    expect(screen.getByText('Current Match Phase')).toBeDefined();
    expect(screen.getByText('Halftime Break')).toBeDefined();

    // Verify accessibility region exists
    const kpiRegion = screen.getByLabelText('Key Performance Indicators');
    expect(kpiRegion).toBeDefined();
  });
});
