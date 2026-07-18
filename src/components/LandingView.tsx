import { Role } from '../App';
import { Users, User, Shield } from 'lucide-react';

interface Props {
  onSelectRole: (role: Role) => void;
}

export function LandingView({ onSelectRole }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F9F9F7] text-[#1A1A1A] font-sans p-6">
      <div className="max-w-2xl w-full">
        <h1 className="text-4xl font-normal tracking-tight text-center mb-2">Project Pamoja</h1>
        <p className="text-[#70706B] text-center mb-12 leading-[1.7]">Select your role to access the real-time operational dashboard.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => onSelectRole('VOLUNTEER')}
            className="flex flex-col items-center justify-center p-8 bg-white border border-[#E5E5E0] hover:border-[#1A1A1A] transition-colors group"
          >
            <User className="w-8 h-8 text-[#1A1A1A] mb-4 opacity-50 group-hover:opacity-100 transition-opacity" />
            <h2 className="text-xs font-medium uppercase tracking-widest">Volunteers</h2>
            <p className="text-xs text-[#70706B] mt-4 text-center leading-[1.7]">Task checklist and accessible routing</p>
          </button>
          
          <button 
            onClick={() => onSelectRole('ORGANIZER')}
            className="flex flex-col items-center justify-center p-8 bg-white border border-[#E5E5E0] hover:border-[#1A1A1A] transition-colors group"
          >
            <Users className="w-8 h-8 text-[#1A1A1A] mb-4 opacity-50 group-hover:opacity-100 transition-opacity" />
            <h2 className="text-xs font-medium uppercase tracking-widest">Organizers</h2>
            <p className="text-xs text-[#70706B] mt-4 text-center leading-[1.7]">KPIs, Heatmaps, and High-level Approvals</p>
          </button>
          
          <button 
            onClick={() => onSelectRole('VENUE_STAFF')}
            className="flex flex-col items-center justify-center p-8 bg-white border border-[#E5E5E0] hover:border-[#1A1A1A] transition-colors group"
          >
            <Shield className="w-8 h-8 text-[#1A1A1A] mb-4 opacity-50 group-hover:opacity-100 transition-opacity" />
            <h2 className="text-xs font-medium uppercase tracking-widest">Venue Staff</h2>
            <p className="text-xs text-[#70706B] mt-4 text-center leading-[1.7]">Gate controls and incident queues</p>
          </button>
        </div>
      </div>
    </div>
  );
}
