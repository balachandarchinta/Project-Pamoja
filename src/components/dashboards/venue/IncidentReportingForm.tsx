import React, { useState, useCallback } from 'react';

export const IncidentReportingForm = React.memo(function IncidentReportingForm() {
  const [incidentType, setIncidentType] = useState('BLOCKED_CORRIDOR');
  const [location, setLocation] = useState('Zone A Concourse');

  const reportIncident = useCallback(async () => {
    await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: incidentType, location })
    });
    // Optional: Reset form or show success message here
  }, [incidentType, location]);

  return (
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
  );
});
