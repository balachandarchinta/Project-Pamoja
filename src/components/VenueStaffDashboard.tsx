import React, { useMemo } from 'react';
import { GlobalState } from '../types';
import { AlertCircle } from 'lucide-react';
import { StadiumVisualizer } from './StadiumVisualizer';
import { IncidentReportingForm } from './dashboards/venue/IncidentReportingForm';
import { ApprovalCard } from './shared/ApprovalCard';

interface Props {
  state: GlobalState;
}

export const VenueStaffDashboard = React.memo(function VenueStaffDashboard({ state }: Props) {
  const venueApprovals = useMemo(() => {
    return state.pendingApprovals.filter(p => p.targetApprovers.includes('Venue Operations Manager'));
  }, [state.pendingApprovals]);

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      <div className="lg:w-[40%] flex flex-col gap-6">
        <div>
          <h3 className="text-xs font-medium uppercase tracking-[0.15em] pb-2 border-b border-[#E5E5E0] mb-6">Live Stadium Map</h3>
          <StadiumVisualizer state={state} />
        </div>
      </div>
      
      <div className="lg:w-[60%] flex flex-col gap-10">
        <section aria-labelledby="incidents-heading" role="region" aria-live="polite">
          <h3 id="incidents-heading" className="text-xs font-medium uppercase tracking-[0.15em] pb-2 border-b border-[#E5E5E0] mb-6">Active Incidents</h3>
          
          {state.mockData.activeIncidents.length === 0 ? (
            <p className="text-sm text-[#70706B] mb-6 py-4">No active incidents.</p>
          ) : (
            <div className="space-y-3 mb-8">
              {state.mockData.activeIncidents.map(inc => (
                <div key={inc.id} className="p-4 bg-[#BC4749]/10 border border-[#BC4749] flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#BC4749]">{inc.type}</p>
                    <p className="text-xs text-[#BC4749] mt-1 opacity-80">{inc.location}</p>
                  </div>
                  <AlertCircle className="w-5 h-5 text-[#BC4749]" />
                </div>
              ))}
            </div>
          )}

          <IncidentReportingForm />
        </section>

        <div>
          <h3 className="text-xs font-medium uppercase tracking-[0.15em] pb-2 border-b border-[#E5E5E0] mb-6">Your Approvals (Venue Operations Manager)</h3>
          {venueApprovals.length === 0 ? (
            <p className="text-sm text-[#70706B] py-4">No pending approvals require your attention.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {venueApprovals.map(item => (
                <ApprovalCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
