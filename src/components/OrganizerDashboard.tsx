import { GlobalState } from '../types';
import { Activity, Users, AlertTriangle } from 'lucide-react';
import { StadiumVisualizer } from './StadiumVisualizer';
import { SparklineChart } from './SparklineChart';
import { TrendData } from '../hooks/useOrchestratorStream';
import { AiResolutionAssistant } from './AiResolutionAssistant';

interface Props {
  state: GlobalState;
  trendHistory: TrendData[];
}

export function OrganizerDashboard({ state, trendHistory }: Props) {
  const { kpis, mockData } = state;
  
  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center bg-white border border-[#E5E5E0] p-4">
        <h2 className="text-xs font-medium uppercase tracking-[0.15em] text-[#70706B]">Current Match Phase</h2>
        <span className="text-sm font-medium tracking-wide text-[#1A1A1A]">{mockData.matchPhase || 'Loading...'}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E5E5E0] p-6 flex flex-col justify-between">
          <div>
            <p className="text-[10px] uppercase font-medium text-[#70706B] mb-4">Total Attendance</p>
            <h2 className="text-5xl font-medium tracking-tight">{kpis.totalAttendance.toLocaleString()}</h2>
          </div>
          <div className="mt-6 h-12 border-t border-[#E5E5E0] pt-4">
            <SparklineChart data={trendHistory} dataKey="totalAttendance" color="#1A1A1A" />
          </div>
        </div>
        
        <div className="bg-white border border-[#E5E5E0] p-6 flex flex-col justify-between">
          <div>
            <p className="text-[10px] uppercase font-medium text-[#70706B] mb-4">Avg Zone Density</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-5xl font-medium tracking-tight">{kpis.avgDensity.toFixed(2)}</h2>
              <span className="text-xs text-[#70706B]">ppl/m²</span>
            </div>
          </div>
          <div className="mt-6 h-12 border-t border-[#E5E5E0] pt-4">
            <SparklineChart data={trendHistory} dataKey="avgDensity" color="#B08968" />
          </div>
        </div>

        <div className="bg-white border border-[#E5E5E0] p-6 border-l-4 border-l-[#BC4749] flex flex-col justify-between">
          <div>
            <p className="text-[10px] uppercase font-medium text-[#70706B] mb-4">Active Incidents</p>
            <h2 className="text-5xl font-medium tracking-tight text-[#BC4749]">{mockData.activeIncidents.length}</h2>
            <p className="text-xs mt-4 font-medium uppercase text-[#BC4749]">Pending Resolution</p>
          </div>
          <div className="mt-6 border-t border-[#E5E5E0] pt-4">
            <AiResolutionAssistant state={state} />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1">
          <h3 className="text-xs font-medium uppercase tracking-[0.15em] pb-2 border-b border-[#E5E5E0] mb-6">Live Stadium Map</h3>
          <StadiumVisualizer state={state} />
        </div>
        
        <div className="flex-1 flex flex-col gap-10">
          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.15em] pb-2 border-b border-[#E5E5E0] mb-6">Zone Density Metrics</h3>
            <div className="grid grid-cols-2 gap-px bg-[#E5E5E0] border border-[#E5E5E0]">
              {Object.entries(mockData.zoneDensity).map(([zone, density]) => {
                let cellStyle = 'bg-white';
                let labelStyle = 'bg-[#F9F9F7] border border-[#E5E5E0] text-[#1A1A1A]';
                if (density > 2.5) {
                   cellStyle = 'bg-[#B08968]/10';
                   labelStyle = 'bg-[#B08968] text-white';
                }
                if (density > 4) {
                   cellStyle = 'bg-[#BC4749]/10';
                   labelStyle = 'bg-[#BC4749] text-white';
                }
                
                return (
                  <div key={zone} className={`p-4 flex justify-between items-center ${cellStyle}`}>
                    <span className="text-sm font-medium">Zone {zone}</span>
                    <span className={`text-xs px-2 py-1 font-medium ${labelStyle}`}>{density.toFixed(1)} p/m²</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.15em] pb-2 border-b border-[#E5E5E0] mb-6">Human-in-the-loop: Pending Approvals</h3>
            {state.pendingApprovals.length === 0 ? (
              <p className="text-sm text-[#70706B] py-4">No pending approvals.</p>
            ) : (
              <div className="flex flex-col gap-3">
            {state.pendingApprovals.map(item => (
              <div key={item.id} className={`p-5 bg-white border border-[#E5E5E0] border-l-4 ${item.priority === 'High' ? 'border-l-[#BC4749]' : item.priority === 'Medium' ? 'border-l-[#B08968]' : 'border-l-[#4361EE]'}`}>
                <div className="flex justify-between mb-3">
                  <span className={`text-[10px] font-medium uppercase tracking-widest ${item.priority === 'High' ? 'text-[#BC4749]' : item.priority === 'Medium' ? 'text-[#B08968]' : 'text-[#4361EE]'}`}>
                    {item.priority} Priority • {item.targetApprovers[0] || 'System'}
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
</div>
  );

  async function approveAction(id: string, action: 'approve'|'reject', targetApprovers: string[]) {
    // For demo purposes, we automatically simulate all required roles approving
    for (const role of targetApprovers) {
      await fetch(`/api/approvals/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, role })
      });
    }
  }
}
