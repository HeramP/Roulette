import React from 'react';
import { RED_NUMBERS, BLACK_NUMBERS, BetType } from '../constants';

interface BettingTableProps {
  currentBets: any[];
  onPlaceBet: (type: BetType, value: number | string) => void;
}

const BettingTable: React.FC<BettingTableProps> = ({ currentBets, onPlaceBet }) => {
  
  // Helper to check chip presence
  const getBetAmount = (type: BetType, value: number | string) => {
    const bet = currentBets.find(b => b.type === type && b.value === value);
    return bet ? bet.amount : 0;
  };

  const ChipOverlay = ({ amount }: { amount: number }) => {
    if (amount === 0) return null;
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="w-6 h-6 bg-yellow-500 rounded-full border-2 border-yellow-300 shadow-lg flex items-center justify-center">
           <span className="text-[8px] font-bold text-black">
             {amount >= 1000 ? `${(amount/1000).toFixed(1)}k` : amount}
           </span>
        </div>
      </div>
    );
  };

  // Render the 3 rows of numbers (3-36, 2-35, 1-34)
  // The grid is actually easier to render 1-36 and rotate/transform or use CSS grid carefully.
  // Standard layout:
  // 0 (Top)
  // 3 6 9 ...
  // 2 5 8 ...
  // 1 4 7 ...
  
  // We will use a CSS Grid with 12 columns and 3 rows for the numbers.
  const renderNumberCell = (num: number) => {
    const isRed = RED_NUMBERS.has(num);
    return (
      <button
        key={num}
        onClick={() => onPlaceBet(BetType.STRAIGHT, num)}
        className={`
          relative h-12 w-full border border-slate-600 flex items-center justify-center text-lg font-bold
          ${isRed ? 'bg-red-600 hover:bg-red-500' : 'bg-neutral-800 hover:bg-neutral-700'}
          transition-colors
        `}
      >
        <span className="text-white drop-shadow-md">{num}</span>
        <ChipOverlay amount={getBetAmount(BetType.STRAIGHT, num)} />
      </button>
    );
  };

  // Generate columns
  const col3 = Array.from({ length: 12 }, (_, i) => (i + 1) * 3); // 3, 6, 9...
  const col2 = Array.from({ length: 12 }, (_, i) => (i + 1) * 3 - 1); // 2, 5, 8...
  const col1 = Array.from({ length: 12 }, (_, i) => (i + 1) * 3 - 2); // 1, 4, 7...

  return (
    <div className="w-full max-w-4xl mx-auto p-2 overflow-x-auto no-scrollbar">
      <div className="min-w-[600px]">
        <div className="grid grid-cols-[50px_repeat(12,_1fr)] gap-0.5 bg-slate-700 p-0.5 rounded-lg shadow-xl">
          
          {/* Zero */}
          <div className="row-span-3 col-start-1 relative">
             <button
                onClick={() => onPlaceBet(BetType.STRAIGHT, 0)}
                className="absolute inset-0 bg-green-600 hover:bg-green-500 rounded-l-md flex items-center justify-center border border-slate-600"
             >
               <span className="text-white font-bold rotate-[-90deg]">0</span>
               <ChipOverlay amount={getBetAmount(BetType.STRAIGHT, 0)} />
             </button>
          </div>

          {/* Row 3 (3, 6, 9...) */}
          {col3.map(num => renderNumberCell(num))}

          {/* Row 2 (2, 5, 8...) */}
          {col2.map(num => renderNumberCell(num))}

          {/* Row 1 (1, 4, 7...) */}
          {col1.map(num => renderNumberCell(num))}
          
          {/* Empty placeholder for alignment if needed, or 2:1 bets */}
          <div className="col-start-1 row-start-4 text-transparent">.</div>

          {/* Bottom Dozens */}
          <div className="col-start-2 col-span-4 row-start-4">
            <button 
              onClick={() => onPlaceBet(BetType.DOZEN_1, '1st 12')}
              className="w-full h-10 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold uppercase relative"
            >
              1st 12
              <ChipOverlay amount={getBetAmount(BetType.DOZEN_1, '1st 12')} />
            </button>
          </div>
          <div className="col-start-6 col-span-4 row-start-4">
            <button 
              onClick={() => onPlaceBet(BetType.DOZEN_2, '2nd 12')}
              className="w-full h-10 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold uppercase relative"
            >
              2nd 12
              <ChipOverlay amount={getBetAmount(BetType.DOZEN_2, '2nd 12')} />
            </button>
          </div>
          <div className="col-start-10 col-span-4 row-start-4">
             <button 
              onClick={() => onPlaceBet(BetType.DOZEN_3, '3rd 12')}
              className="w-full h-10 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold uppercase relative"
            >
              3rd 12
              <ChipOverlay amount={getBetAmount(BetType.DOZEN_3, '3rd 12')} />
            </button>
          </div>

          {/* Bottom 50/50 Bets */}
           <div className="col-start-2 col-span-2 row-start-5">
            <button onClick={() => onPlaceBet(BetType.LOW, '1-18')} className="w-full h-10 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold uppercase relative">
              1-18
              <ChipOverlay amount={getBetAmount(BetType.LOW, '1-18')} />
            </button>
          </div>
          <div className="col-start-4 col-span-2 row-start-5">
             <button onClick={() => onPlaceBet(BetType.EVEN, 'EVEN')} className="w-full h-10 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold uppercase relative">
              EVEN
              <ChipOverlay amount={getBetAmount(BetType.EVEN, 'EVEN')} />
            </button>
          </div>
          <div className="col-start-6 col-span-2 row-start-5">
             <button onClick={() => onPlaceBet(BetType.RED, 'RED')} className="w-full h-10 bg-red-900 hover:bg-red-800 border border-slate-600 text-xs font-bold uppercase relative">
              RED
              <ChipOverlay amount={getBetAmount(BetType.RED, 'RED')} />
            </button>
          </div>
          <div className="col-start-8 col-span-2 row-start-5">
             <button onClick={() => onPlaceBet(BetType.BLACK, 'BLACK')} className="w-full h-10 bg-black hover:bg-gray-900 border border-slate-600 text-xs font-bold uppercase relative">
              BLACK
              <ChipOverlay amount={getBetAmount(BetType.BLACK, 'BLACK')} />
            </button>
          </div>
           <div className="col-start-10 col-span-2 row-start-5">
             <button onClick={() => onPlaceBet(BetType.ODD, 'ODD')} className="w-full h-10 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold uppercase relative">
              ODD
              <ChipOverlay amount={getBetAmount(BetType.ODD, 'ODD')} />
            </button>
          </div>
           <div className="col-start-12 col-span-2 row-start-5">
             <button onClick={() => onPlaceBet(BetType.HIGH, '19-36')} className="w-full h-10 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold uppercase relative">
              19-36
              <ChipOverlay amount={getBetAmount(BetType.HIGH, '19-36')} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BettingTable;