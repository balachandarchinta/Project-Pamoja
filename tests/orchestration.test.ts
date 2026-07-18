import { describe, it, expect, beforeEach } from 'vitest';
import { updateMockData } from '../server/orchestration.js';
import { state } from '../server/schema.js';

describe('Orchestration Phase Transitions', () => {
  beforeEach(() => {
    // reset cycle logic by resetting state if needed, 
    // but updateMockData relies on internal cycleCount. 
    // We will just run it a few times to observe transitions.
  });

  it('correctly transitions through all 5 match phases', () => {
    const phasesObserved = new Set<string>();
    
    // updateMockData increments a counter and divides by 6 to determine phase.
    // 6 * 5 phases = 30 calls will cover all phases at least once.
    for (let i = 0; i < 35; i++) {
      updateMockData();
      phasesObserved.add(state.mockData.matchPhase);
    }

    expect(phasesObserved.has('Pre-Match (Gates Open)')).toBe(true);
    expect(phasesObserved.has('First Half')).toBe(true);
    expect(phasesObserved.has('Halftime Break')).toBe(true);
    expect(phasesObserved.has('Second Half')).toBe(true);
    expect(phasesObserved.has('Post-Match (Egress)')).toBe(true);
    expect(phasesObserved.size).toBe(5);
  });
});
