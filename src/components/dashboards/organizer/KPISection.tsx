import React from 'react';
import { SparklineChart } from '../../SparklineChart';
import { TrendData } from '../../../hooks/useOrchestratorStream';
import { GlobalState } from '../../../types';
import { AiResolutionAssistant } from '../../AiResolutionAssistant';

interface Props {
  kpis: GlobalState['kpis'];
  mockData: GlobalState['mockData'];
  trendHistory: TrendData[];
  state: GlobalState; // Passed down to AiResolutionAssistant
}

export const KPISection = React.memo(function KPISection({ kpis, mockData, trendHistory, state }: Props) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6" aria-label="Key Performance Indicators">
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

      <div className="bg-white border border-[#E5E5E0] p-6 border-l-4 border-l-[#BC4749] flex flex-col justify-between" role="region" aria-live="polite">
        <div>
          <p className="text-[10px] uppercase font-medium text-[#70706B] mb-4">Active Incidents</p>
          <h2 className="text-5xl font-medium tracking-tight text-[#BC4749]">{mockData.activeIncidents.length}</h2>
          <p className="text-xs mt-4 font-medium uppercase text-[#BC4749]">Pending Resolution</p>
        </div>
        <div className="mt-6 border-t border-[#E5E5E0] pt-4">
          <AiResolutionAssistant state={state} />
        </div>
      </div>
    </section>
  );
});
