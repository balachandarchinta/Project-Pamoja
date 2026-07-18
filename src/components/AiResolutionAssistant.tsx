import { useState } from 'react';
import { Loader2, BrainCircuit, X } from 'lucide-react';
import { GlobalState } from '../types';

interface Props {
  state: GlobalState;
}

export function AiResolutionAssistant({ state }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const analyzeSituation = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/think', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          context: state.mockData
        })
      });
      const data = await res.json();
      setResult(data.result);
    } catch (err) {
      console.error(err);
      setResult("Error generating resolution strategy.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 mt-6 text-[10px] font-medium uppercase tracking-widest text-[#1A1A1A] hover:opacity-70 transition-opacity"
      >
        <BrainCircuit className="w-4 h-4" />
        Analyze with AI
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5E0] w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E0] bg-[#F9F9F7]">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5" />
                <h2 className="text-xs font-medium uppercase tracking-[0.15em]">AI Orchestrator (Thinking Mode)</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-[#70706B] hover:text-[#1A1A1A]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-medium text-[#70706B] block">Operational Query</label>
                <textarea 
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="E.g., How should we safely reroute crowds around the blocked corridor in Zone C without causing a bottleneck in Zone D?"
                  className="w-full bg-[#F9F9F7] border border-[#E5E5E0] p-4 text-sm font-medium resize-none h-24 focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              {loading && (
                <div className="flex items-center gap-3 text-sm text-[#70706B] p-4 bg-[#F9F9F7]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing operational constraints and stadium density...
                </div>
              )}

              {result && (
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-medium text-[#70706B] block">Resolution Strategy</label>
                  <div className="prose prose-sm max-w-none text-sm leading-relaxed p-6 bg-[#FDFDFB] border border-[#E5E5E0]">
                    {result.split('\n').map((line, i) => <p key={i} className="mb-2 last:mb-0">{line}</p>)}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#E5E5E0] flex justify-end">
              <button 
                onClick={analyzeSituation}
                disabled={loading || !query.trim()}
                className="bg-[#1A1A1A] text-white px-6 py-3 text-[11px] font-medium uppercase disabled:opacity-50"
              >
                Synthesize Strategy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
