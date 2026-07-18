import { GlobalState } from '../types';
import { CheckCircle2, Circle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
  state: GlobalState;
}

export function VolunteerDashboard({ state }: Props) {
  const [announcement, setAnnouncement] = useState('');

  // Volunteers only see executed decisions that require physical actions or info updates
  const recentTasks = state.recentDecisions.filter(d => 
    d.priority !== 'Low' && d.recommendations.some(r => !r.requiresHumanApproval || d.agentId === 'human-in-the-loop')
  ).slice(-5);

  useEffect(() => {
    if (recentTasks.length > 0) {
      setAnnouncement(`New task added: ${recentTasks[recentTasks.length - 1].recommendations[0]?.description}`);
    }
  }, [recentTasks.length]);

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="sr-only" aria-live="assertive" role="alert">
        {announcement}
      </div>
      
      <h3 className="text-xs font-medium uppercase tracking-[0.15em] pb-2 border-b border-[#E5E5E0] mb-6">Task Checklist</h3>
      
      {recentTasks.length === 0 ? (
        <p className="text-sm text-[#70706B] text-center py-8">All clear. No active tasks.</p>
      ) : (
        <div className="space-y-3">
          {recentTasks.map((task, i) => (
             <div key={i} className="bg-white border border-[#E5E5E0] p-5 flex items-start gap-4">
               <Circle className="w-5 h-5 text-[#E5E5E0] shrink-0 mt-0.5" />
               <div>
                 <p className="text-sm font-medium text-[#1A1A1A] leading-[1.7]">
                   {task.recommendations[0]?.description}
                 </p>
                 <p className="text-[10px] uppercase tracking-widest text-[#70706B] mt-2">
                   Priority: <span className="font-medium text-[#1A1A1A]">{task.priority}</span>
                 </p>
               </div>
             </div>
          ))}
        </div>
      )}
      
      <div className="bg-[#4361EE]/10 border border-[#4361EE] p-5 mt-8">
        <h3 className="text-[10px] uppercase font-medium tracking-widest text-[#4361EE] mb-2">Accessibility Assist</h3>
        <p className="text-sm text-[#1A1A1A]">
          Pending requests in system: <span className="font-medium">{state.mockData.accessibilityRequests}</span>
        </p>
      </div>
    </div>
  );
}
