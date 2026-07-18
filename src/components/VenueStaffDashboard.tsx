import { GlobalState } from '../types';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { StadiumVisualizer } from './StadiumVisualizer';

interface Props {
  state: GlobalState;
}

export function VenueStaffDashboard({ state }: Props) {
  const [incidentType, setIncidentType] = useState('BLOCKED_CORRIDOR');
  const [location, setLocation] = useState('Zone A Concourse');

  const reportIncident = async () => {
    await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: incidentType, location })
    });
  };

  const venueApprovals = state.pendingApprovals.filter(p => p.targetApprovers.includes('Venue Operations Manager'));

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

          <div className="bg-white border border-[#E5E5E0] p-6 flex items-end gap-4">
            <div className="flex-1">
            <label htmlFor="incidentType" className="block text-[10px] uppercase font-medium text-[#70706B] mb-2">Incident Type</label>
            <select id="incidentType" value={incidentType} onChange={e=>setIncidentType(e.target.value)} className="w-full border-[#E5E5E0] text-sm shadow-sm border p-3 bg-white outline-none">
              <option value="BLOCKED_CORRIDOR">Blocked Corridor</option>
              <option value="MEDICAL">Medical Emergency</option>
              <option value="GATE_FAILURE">Gate Failure</option>
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="incidentLocation" className="block text-[10px] uppercase font-medium text-[#70706B] mb-2">Location</label>
            <input id="incidentLocation" type="text" value={location} onChange={e=>setLocation(e.target.value)} className="w-full border-[#E5E5E0] text-sm shadow-sm border p-3 outline-none" />
          </div>
          <button onClick={reportIncident} className="px-6 bg-[#1A1A1A] text-white text-[11px] font-medium uppercase h-[46px]">
            Report Event
          </button>
        </div>
      </section>

      <div>
        <h3 className="text-xs font-medium uppercase tracking-[0.15em] pb-2 border-b border-[#E5E5E0] mb-6">Your Approvals (Venue Operations Manager)</h3>
        {venueApprovals.length === 0 ? (
          <p className="text-sm text-[#70706B] py-4">No pending approvals require your attention.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {venueApprovals.map(item => (
               <div key={item.id} className={`p-5 bg-white border border-[#E5E5E0] border-l-4 ${item.priority === 'High' ? 'border-l-[#BC4749]' : item.priority === 'Medium' ? 'border-l-[#B08968]' : 'border-l-[#4361EE]'}`}>
                 <div className="flex justify-between mb-3">
                   <span className={`text-[10px] font-medium uppercase tracking-widest ${item.priority === 'High' ? 'text-[#BC4749]' : item.priority === 'Medium' ? 'text-[#B08968]' : 'text-[#4361EE]'}`}>
                     {item.priority} Priority
                   </span>
                   <span className="text-[10px] text-[#70706B]">Agent: {item.sourceAgent}</span>
                 </div>
                 <p className="text-sm mb-4 leading-relaxed">{item.description}</p>
                 <div className="flex gap-2">
                   <button 
                     onClick={() => approveAction(item.id, 'approve', item.targetApprovers)}
                     className="flex-1 bg-[#1A1A1A] text-white text-[11px] font-medium uppercase py-3"
                   >
                     Approve Action
                   </button>
                   <button 
                     onClick={() => approveAction(item.id, 'reject', item.targetApprovers)}
                     className="px-6 border border-[#E5E5E0] text-[#1A1A1A] text-[11px] font-medium uppercase hover:bg-[#F9F9F7]"
                   >
                     Reject
                   </button>
                 </div>
               </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
  );

  async function approveAction(id: string, action: 'approve'|'reject', targetApprovers: string[]) {
    // For demo purposes, simulate all required roles approving
    for (const role of targetApprovers) {
      await fetch(`/api/approvals/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, role })
      });
    }
  }
}
