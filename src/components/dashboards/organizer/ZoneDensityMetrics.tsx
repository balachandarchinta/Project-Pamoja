import React from 'react';

interface Props {
  zoneDensity: Record<string, number>;
}

export const ZoneDensityMetrics = React.memo(function ZoneDensityMetrics({ zoneDensity }: Props) {
  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-[0.15em] pb-2 border-b border-[#E5E5E0] mb-6">Zone Density Metrics</h3>
      <div className="grid grid-cols-2 gap-px bg-[#E5E5E0] border border-[#E5E5E0]">
        {Object.entries(zoneDensity).map(([zone, density]) => {
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
  );
});
