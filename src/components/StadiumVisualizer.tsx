import React, { useMemo } from 'react';
import { GlobalState } from '../types';

interface Props {
  state: GlobalState;
}

const ZONES = [
  { id: 'A', cx: 100, cy: 100, gateId: '8', gateCx: 60, gateCy: 60 },
  { id: 'B', cx: 200, cy: 60, gateId: '1', gateCx: 200, gateCy: 10 },
  { id: 'C', cx: 300, cy: 100, gateId: '2', gateCx: 340, gateCy: 60 },
  { id: 'D', cx: 340, cy: 200, gateId: '3', gateCx: 390, gateCy: 200 },
  { id: 'E', cx: 300, cy: 300, gateId: '4', gateCx: 340, gateCy: 340 },
  { id: 'F', cx: 200, cy: 340, gateId: '5', gateCx: 200, gateCy: 390 },
  { id: 'G', cx: 100, cy: 300, gateId: '6', gateCx: 60, gateCy: 340 },
  { id: 'H', cx: 60, cy: 200, gateId: '7', gateCx: 10, gateCy: 200 },
];

export const StadiumVisualizer = React.memo(function StadiumVisualizer({ state }: Props) {
  // Find zones with active incidents
  const incidentZones = useMemo(() => {
    const zones = new Set<string>();
    state.mockData.activeIncidents.forEach(inc => {
      const match = inc.location.match(/Zone ([A-H])/);
      if (match) {
        zones.add(match[1]);
      }
    });
    return zones;
  }, [state.mockData.activeIncidents]);

  return (
    <div className="relative w-full aspect-square bg-white border border-[#E5E5E0] flex items-center justify-center p-8">
      <svg viewBox="0 0 400 400" className="w-full h-full text-[#1A1A1A]">
        {/* Outer perimeter */}
        <circle cx="200" cy="200" r="190" fill="none" stroke="#E5E5E0" strokeWidth="2" />
        
        {/* Inner pitch */}
        <rect x="140" y="100" width="120" height="200" rx="60" fill="#F9F9F7" stroke="#E5E5E0" strokeWidth="2" />
        
        {/* Zone lines */}
        <line x1="200" y1="10" x2="200" y2="100" stroke="#E5E5E0" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="200" y1="300" x2="200" y2="390" stroke="#E5E5E0" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="10" y1="200" x2="140" y2="200" stroke="#E5E5E0" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="260" y1="200" x2="390" y2="200" stroke="#E5E5E0" strokeWidth="1" strokeDasharray="4 4" />
        
        <line x1="66" y1="66" x2="140" y2="140" stroke="#E5E5E0" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="334" y1="66" x2="260" y2="140" stroke="#E5E5E0" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="334" y1="334" x2="260" y2="260" stroke="#E5E5E0" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="66" y1="334" x2="140" y2="260" stroke="#E5E5E0" strokeWidth="1" strokeDasharray="4 4" />

        {/* Zones and Highlights */}
        {ZONES.map(z => {
          const hasIncident = incidentZones.has(z.id);
          const density = state.mockData.zoneDensity[z.id];
          const isHighDensity = density > 4;
          const isMediumDensity = density > 2.5;
          
          let fillClass = 'fill-transparent';
          if (hasIncident || isHighDensity) fillClass = 'fill-[#BC4749]';
          else if (isMediumDensity) fillClass = 'fill-[#B08968]';

          return (
            <g key={z.id}>
              {/* Highlight blob */}
              {(hasIncident || isHighDensity || isMediumDensity) && (
                <circle cx={z.cx} cy={z.cy} r="40" className={`${fillClass} opacity-[0.08]`} />
              )}
              
              <text x={z.cx} y={z.cy} textAnchor="middle" dominantBaseline="middle" className="text-sm font-medium fill-current">
                Zone {z.id}
              </text>
              <text x={z.cx} y={z.cy + 16} textAnchor="middle" dominantBaseline="middle" className="text-[10px] fill-[#70706B] font-medium tracking-widest">
                {density.toFixed(1)} P/M²
              </text>

              {/* Connecting line to nearest gate if incident */}
              {hasIncident && (
                <line x1={z.cx} y1={z.cy} x2={z.gateCx} y2={z.gateCy} stroke="#BC4749" strokeWidth="2" strokeDasharray="3 3" className="animate-pulse" />
              )}

              {/* Gate Marker */}
              <circle cx={z.gateCx} cy={z.gateCy} r="14" fill={hasIncident ? '#BC4749' : '#FDFDFB'} stroke={hasIncident ? '#BC4749' : '#1A1A1A'} strokeWidth="1.5" />
              <text x={z.gateCx} y={z.gateCy} textAnchor="middle" dominantBaseline="middle" className={`text-[9px] font-medium ${hasIncident ? 'fill-white' : 'fill-[#1A1A1A]'}`}>
                G{z.gateId}
              </text>
            </g>
          );
        })}
      </svg>
      {/* Legend / Overlay info */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm border border-[#E5E5E0] p-4 shadow-sm">
        <h4 className="text-[9px] uppercase tracking-widest font-medium mb-3 text-[#1A1A1A]">Map Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#BC4749]"></div>
            <span className="text-[10px] text-[#70706B] font-medium uppercase">Incident / Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#B08968]"></div>
            <span className="text-[10px] text-[#70706B] font-medium uppercase">Surge / Density</span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <div className="w-4 h-4 border border-[#1A1A1A] rounded-full flex items-center justify-center text-[7px] text-[#1A1A1A] font-medium">G1</div>
            <span className="text-[10px] text-[#70706B] font-medium uppercase">Nearest Gate</span>
          </div>
        </div>
      </div>
    </div>
  );
});
