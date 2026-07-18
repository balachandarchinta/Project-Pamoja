/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { LandingView } from './components/LandingView';
import { OrganizerDashboard } from './components/OrganizerDashboard';
import { VolunteerDashboard } from './components/VolunteerDashboard';
import { VenueStaffDashboard } from './components/VenueStaffDashboard';
import { useOrchestratorStream } from './hooks/useOrchestratorStream';

export type Role = 'ORGANIZER' | 'VOLUNTEER' | 'VENUE_STAFF' | null;

export default function App() {
  const [role, setRole] = useState<Role>(null);
  const { state, lastUpdated, isConnected, trendHistory } = useOrchestratorStream();

  if (!role) {
    return <LandingView onSelectRole={setRole} />;
  }

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F9F9F7] text-[#1A1A1A] font-sans" role="status" aria-live="polite">
      <p className="text-sm font-medium uppercase tracking-wider text-[#70706B]">Connecting to orchestrator...</p>
    </div>
  );
}

return (
  <div className="min-h-screen bg-[#F9F9F7] text-[#1A1A1A] font-sans flex flex-col">
    <header className="h-16 bg-white border-b border-[#E5E5E0] px-8 flex justify-between items-center sticky top-0 z-10">
      <h1 className="text-xs tracking-[0.2em] font-medium uppercase">
        {role === 'ORGANIZER' ? 'Organizer Dashboard' : role === 'VOLUNTEER' ? 'Volunteer Tasks' : 'Venue Operations'}
      </h1>
      <div className="relative flex items-center">
        <select
          value={role || ''}
          onChange={(e) => setRole(e.target.value as Role)}
          aria-label="Select user role"
          className="appearance-none bg-transparent text-[11px] font-medium uppercase tracking-wider text-[#70706B] hover:text-[#1A1A1A] transition-colors outline-none cursor-pointer pr-4"
        >
          <option value="ORGANIZER">Organizer</option>
          <option value="VOLUNTEER">Volunteer</option>
          <option value="VENUE_STAFF">Venue Staff</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-[#70706B]">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
        </div>
      </div>
    </header>
    <main className="flex-1 max-w-7xl mx-auto w-full p-8 md:p-10">
        {role === 'ORGANIZER' && <OrganizerDashboard state={state} trendHistory={trendHistory} />}
        {role === 'VOLUNTEER' && <VolunteerDashboard state={state} />}
        {role === 'VENUE_STAFF' && <VenueStaffDashboard state={state} />}
      </main>
      <footer className="h-12 border-t border-[#E5E5E0] px-8 flex items-center bg-[#FDFDFB] mt-auto">
        <div className="flex gap-8 items-center w-full">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 ${isConnected ? 'bg-[#2D6A4F] animate-pulse' : 'bg-[#BC4749]'}`} aria-hidden="true"></div>
            <span className="text-[10px] uppercase font-medium" role="status" aria-live="polite">
              Live Stream: {isConnected ? 'All Agents Operational' : 'Connection Lost'}
            </span>
          </div>
          <span className="text-[10px] text-[#70706B] uppercase font-medium">
            Last Updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Waiting...'}
          </span>
          <span className="text-[10px] text-[#70706B] ml-auto uppercase font-medium">Session Log: WC26-STA-001</span>
        </div>
      </footer>
    </div>
  );
}
