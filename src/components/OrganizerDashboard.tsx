import React from 'react';
import { GlobalState } from '../types';
import { StadiumVisualizer } from './StadiumVisualizer';
import { TrendData } from '../hooks/useOrchestratorStream';
import { KPISection } from './dashboards/organizer/KPISection';
import { ZoneDensityMetrics } from './dashboards/organizer/ZoneDensityMetrics';
import { PendingApprovalsList } from './dashboards/organizer/PendingApprovalsList';

interface Props {
  state: GlobalState;
  trendHistory: TrendData[];
}

export const OrganizerDashboard = React.memo(function OrganizerDashboard({ state, trendHistory }: Props) {
  const { kpis, mockData, pendingApprovals } = state;
  
  return (
    <div className="space-y-10">
      <section className="flex justify-between items-center bg-white border border-[#E5E5E0] p-4" aria-labelledby="phase-heading">
        <h2 id="phase-heading" className="text-xs font-medium uppercase tracking-[0.15em] text-[#70706B]">Current Match Phase</h2>
        <span className="text-sm font-medium tracking-wide text-[#1A1A1A]">{mockData.matchPhase || 'Loading...'}</span>
      </section>
      
      <KPISection kpis={kpis} mockData={mockData} trendHistory={trendHistory} state={state} />
      
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1">
          <h3 className="text-xs font-medium uppercase tracking-[0.15em] pb-2 border-b border-[#E5E5E0] mb-6">Live Stadium Map</h3>
          <StadiumVisualizer state={state} />
        </div>
        
        <div className="flex-1 flex flex-col gap-10">
          <ZoneDensityMetrics zoneDensity={mockData.zoneDensity} />
          <PendingApprovalsList pendingApprovals={pendingApprovals} />
        </div>
      </div>
    </div>
  );
});
