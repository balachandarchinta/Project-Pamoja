import { useState, useEffect } from 'react';
import { GlobalState } from '../types';

export interface TrendData {
  time: string;
  avgDensity: number;
  totalAttendance: number;
}

export function useOrchestratorStream() {
  const [state, setState] = useState<GlobalState | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [trendHistory, setTrendHistory] = useState<TrendData[]>([]);

  useEffect(() => {
    const sse = new EventSource('/api/stream');
    
    sse.onopen = () => setIsConnected(true);
    
    sse.onmessage = (e) => {
      try {
        const newState = JSON.parse(e.data) as GlobalState;
        setState(newState);
        
        const now = new Date();
        setLastUpdated(now);
        
        setTrendHistory(prev => {
          const newData = {
            time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            avgDensity: newState.kpis.avgDensity,
            totalAttendance: newState.kpis.totalAttendance
          };
          const updated = [...prev, newData];
          // Keep last 20 data points
          return updated.slice(-20);
        });
        
      } catch (err) {
        console.error("Failed to parse SSE data", err);
      }
    };

    sse.onerror = () => setIsConnected(false);

    return () => sse.close();
  }, []);

  return { state, lastUpdated, isConnected, trendHistory };
}
