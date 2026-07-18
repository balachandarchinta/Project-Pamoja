import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { TrendData } from '../hooks/useOrchestratorStream';

interface Props {
  data: TrendData[];
  dataKey: keyof TrendData;
  color?: string;
}

export function SparklineChart({ data, dataKey, color = '#1A1A1A' }: Props) {
  if (!data || data.length === 0) {
    return <div className="w-full h-full flex items-center justify-center text-[10px] text-[#70706B] uppercase font-medium">Gathering data...</div>;
  }

  // Calculate min/max for scaling
  const values = data.map(d => d[dataKey] as number);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min) * 0.1 || 1;

  return (
    <div className="w-full h-full min-h-[40px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis domain={[min - padding, max + padding]} hide />
          <Line 
            type="monotone" 
            dataKey={dataKey as string} 
            stroke={color} 
            strokeWidth={1.5} 
            dot={false} 
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
