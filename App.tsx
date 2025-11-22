import React, { useState, useCallback } from 'react';
import RouletteWheel from './components/RouletteWheel';
import BettingTable from './components/BettingTable';
import ChipSelector from './components/ChipSelector';
import SoundManager from './components/SoundManager';
import StatsPanel from './components/StatsPanel';
import { BetType, WHEEL_NUMBERS, RED_NUMBERS } from './constants';
import { Bet } from './types';
import { calculateWinnings } from './utils/gameLogic';
import { RefreshCw, Trash2, CircleDollarSign } from 'lucide-react';

const App: React.FC = () => {
  const [balance, setBalance] = useState(10000);
  const [currentBets, setCurrentBets] = useState<Bet[]>([]);
  const [history, setHistory] = useState<number[]>([]);
  const [selectedChip, setSelectedChip] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [lastWinAmount, setLastWinAmount] = useState<number | null>(null);
  const [prevBets, setPrevBets] = useState<Bet[]>([]); // For "Rebet" functionality
  
  // Sound State
  const [soundEffect, setSoundEffect] = useState<{ type: string; id: number } | null>(null);

  const triggerSound = (type: string) => {
    setSoundEffect({ type, id: Date.now() });
  };

  const handlePlaceBet = (type: BetType, value: number | string) => {
    if (isSpinning) return;

    const cost = selectedChip;
    if (balance < cost) {
      alert("Not enough funds!");
      return;
    }

    triggerSound('bet');
    setBalance(prev => prev - cost);

    setCurrentBets(prev => {
      const existingBetIndex = prev.findIndex(b => b.type === type && b.value === value);
      if (existingBetIndex >= 0) {
        const newBets = [...prev];
        newBets[existingBetIndex] = {
          ...newBets[existingBetIndex],
          amount: newBets[existingBetIndex].amount + cost
        };
        return newBets;
      } else {
        return [...prev, { id: Date.now().toString(), type, value, amount: cost }];
      }
    });
  };

  const clearBets = () => {
    if (isSpinning) return;
    if (currentBets.length > 0) {
       // Refund
       const totalBet = currentBets.reduce((acc, bet) => acc + bet.amount, 0);
       setBalance(prev => prev + totalBet);
       setCurrentBets([]);
       triggerSound('bet'); // Audio feedback for clear (optional, using same chip sound)
    }
  };

  const rebet = () => {
    if (isSpinning || prevBets.length === 0) return;
    const totalCost = prevBets.reduce((acc, bet) => acc + bet.amount, 0);
    
    if (balance < totalCost) {
      alert("Not enough funds to rebet!");
      return;
    }

    triggerSound('bet');
    setBalance(prev => prev - totalCost);
    setCurrentBets([...prevBets]);
  };

  const spinWheel = () => {
    if (currentBets.length === 0) {
        alert("Place a bet first!");
        return;
    }
    if (isSpinning) return;

    // Save bets for rebet
    setPrevBets([...currentBets]);
    
    triggerSound('spin');
    setIsSpinning(true);
    setLastWinAmount(null);
    
    // Determine result immediately (Server-side logic in real app)
    const randomIndex = Math.floor(Math.random() * WHEEL_NUMBERS.length);
    const result = WHEEL_NUMBERS[randomIndex];
    setWinningNumber(result);
  };

  const handleSpinComplete = useCallback(() => {
    if (winningNumber === null) return;

    const winnings = calculateWinnings(winningNumber, currentBets);
    
    setBalance(prev => prev + winnings);
    setLastWinAmount(winnings);
    // Keep last 50 numbers for stats, but we will only display top 10 in the bar
    setHistory(prev => [winningNumber, ...prev].slice(0, 50));
    setCurrentBets([]); // Clear bets after round
    setIsSpinning(false);

    if (winnings > 0) {
      triggerSound('win');
    }
  }, [winningNumber, currentBets]);

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-sans">
      <SoundManager playSound={soundEffect} />
      
      {/* Top Bar: History & Balance */}
      <div className="flex justify-between items-center px-4 py-3 bg-slate-800 shadow-md z-20">
        <div className="flex items-center space-x-2 overflow-hidden">
          <span className="text-xs text-slate-400 mr-1">PREV:</span>
          {history.slice(0, 10).map((num, i) => (
             <div 
                key={i} 
                className={`
                  w-8 h-8 flex items-center justify-center rounded-md text-sm font-bold border border-slate-600 shrink-0
                  ${num === 0 ? 'bg-green-600' : RED_NUMBERS.has(num) ? 'bg-red-600' : 'bg-slate-700'}
                `}
             >
               {num}
             </div>
          ))}
        </div>
        <div className="flex items-center bg-slate-900 px-3 py-1 rounded-full border border-slate-600 shrink-0 ml-2">
          <CircleDollarSign className="w-4 h-4 text-yellow-400 mr-2" />
          <span className="font-mono text-lg text-yellow-400">{balance.toLocaleString()}</span>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative bg-[url('https://www.transparenttextures.com/patterns/felt.png')] bg-green-900/20">
        
        {/* Wheel Section */}
        <div className="py-4 flex justify-center items-center perspective-1000">
            <div className="transform scale-75 sm:scale-90 md:scale-100">
                <RouletteWheel 
                    winningNumber={winningNumber} 
                    isSpinning={isSpinning} 
                    onSpinComplete={handleSpinComplete} 
                />
            </div>
        </div>

        {/* Winning Message Overlay */}
        {!isSpinning && lastWinAmount !== null && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
             <div className="bg-black/80 backdrop-blur-sm border-2 border-yellow-400 p-6 rounded-xl text-center animate-bounce shadow-2xl">
                <h2 className="text-2xl font-bold text-yellow-400 mb-1">
                    {lastWinAmount > 0 ? 'YOU WON!' : 'NO WINS'}
                </h2>
                <p className="text-4xl font-bold text-white">
                    ${lastWinAmount}
                </p>
             </div>
          </div>
        )}

        {/* Stats Panel */}
        <div className="px-2">
           <StatsPanel history={history} />
        </div>

        {/* Betting Table */}
        <div className="pb-32 px-2">
             <BettingTable currentBets={currentBets} onPlaceBet={handlePlaceBet} />
        </div>

      </div>

      {/* Bottom Controls - Fixed */}
      <div className="absolute bottom-0 w-full bg-slate-900 border-t border-slate-700 z-30 pb-safe">
        
        {/* Chip Selector */}
        <ChipSelector selectedChip={selectedChip} onSelect={setSelectedChip} />

        {/* Action Buttons */}
        <div className="flex justify-between items-center p-4 gap-4 max-w-2xl mx-auto">
           
           <button 
              onClick={clearBets} 
              disabled={isSpinning || currentBets.length === 0}
              className="flex flex-col items-center justify-center text-slate-400 hover:text-red-400 disabled:opacity-30 transition-colors"
            >
              <Trash2 className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-bold tracking-wider">CLEAR</span>
           </button>

           <div className="flex-1 mx-4">
               <button
                 onClick={spinWheel}
                 disabled={isSpinning || currentBets.length === 0}
                 className={`
                    w-full py-4 rounded-full font-black text-xl tracking-widest shadow-lg
                    transform active:scale-95 transition-all
                    ${isSpinning 
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                        : 'bg-gradient-to-b from-yellow-400 to-yellow-600 text-black hover:shadow-yellow-500/50'}
                 `}
               >
                  {isSpinning ? 'SPINNING...' : 'SPIN'}
               </button>
           </div>

           <button 
              onClick={rebet} 
              disabled={isSpinning || prevBets.length === 0}
              className="flex flex-col items-center justify-center text-slate-400 hover:text-blue-400 disabled:opacity-30 transition-colors"
            >
              <RefreshCw className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-bold tracking-wider">REBET</span>
           </button>

        </div>
      </div>
    </div>
  );
};

export default App;