import React, { useMemo } from 'react';
import { RED_NUMBERS } from '../constants';

interface StatsPanelProps {
  history: number[];
}

const StatsPanel: React.FC<StatsPanelProps> = ({ history }) => {
  const { hot, cold } = useMemo(() => {
    // Need at least a few spins to show stats, otherwise it's just noise
    if (history.length < 3) return { hot: [], cold: [] };

    const counts: Record<number, number> = {};
    // Initialize all 0-36 with 0
    for (let i = 0; i <= 36; i++) counts[i] = 0;

    // Count occurrences in current history
    history.forEach(num => {
        counts[num] = (counts[num] || 0) + 1;
    });

    const allNums = Array.from({ length: 37 }, (_, i) => i);

    // Sort for Hot (High Frequency)
    const hot = [...allNums].sort((a, b) => {
        if (counts[b] !== counts[a]) return counts[b] - counts[a]; // Descending count
        return b - a; // Tie-breaker
    }).slice(0, 5);

    // Sort for Cold (Low Frequency)
    const cold = [...allNums].sort((a, b) => {
         if (counts[a] !== counts[b]) return counts[a] - counts[b]; // Ascending count
         return a - b; // Tie-breaker
    }).slice(0, 5);

    return { hot, cold };
  }, [history]);

  if (hot.length === 0) return null;

  const renderBadge = (num: number) => {
      let bg = 'bg-slate-700';
      if (num === 0) bg = 'bg-green-600';
      else if (RED_NUMBERS.has(num)) bg = 'bg-red-600';
      
      return (
          <div key={num} className={`w-8 h-8 ${bg} rounded-full flex items-center justify-center text-xs font-bold shadow-md border border-white/10 shrink-0`}>
              {num}
          </div>
      );
  };

  return (
    <div className="flex w-full max-w-3xl mx-auto gap-3 mb-2">
        {/* HOT Section */}
        <div className="flex-1 bg-slate-800/80 backdrop-blur-sm rounded-xl p-2 sm:p-3 border-l-4 border-l-orange-500 border-y border-r border-slate-700 shadow-lg flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2 w-full justify-center border-b border-white/5 pb-1">
                <span className="text-orange-500 text-sm drop-shadow-sm">🔥</span>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-300">Hot</span>
            </div>
            <div className="flex gap-2 justify-center flex-wrap">
                {hot.map(renderBadge)}
            </div>
        </div>

        {/* COLD Section */}
        <div className="flex-1 bg-slate-800/80 backdrop-blur-sm rounded-xl p-2 sm:p-3 border-l-4 border-l-cyan-500 border-y border-r border-slate-700 shadow-lg flex flex-col items-center">
             <div className="flex items-center gap-2 mb-2 w-full justify-center border-b border-white/5 pb-1">
                <span className="text-cyan-400 text-sm drop-shadow-sm">❄️</span>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-300">Cold</span>
            </div>
            <div className="flex gap-2 justify-center flex-wrap">
                {cold.map(renderBadge)}
            </div>
        </div>
    </div>
  );
};

export default StatsPanel;