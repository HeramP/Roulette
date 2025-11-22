import React from 'react';
import { CHIP_VALUES } from '../constants';

interface ChipSelectorProps {
  selectedChip: number;
  onSelect: (value: number) => void;
}

const ChipSelector: React.FC<ChipSelectorProps> = ({ selectedChip, onSelect }) => {
  return (
    <div className="flex justify-center space-x-2 py-2 overflow-x-auto no-scrollbar bg-slate-800/90 backdrop-blur-md border-t border-slate-700 w-full">
      {CHIP_VALUES.map((val) => (
        <button
          key={val}
          onClick={() => onSelect(val)}
          className={`
            relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs shadow-lg transition-transform transform
            ${selectedChip === val ? 'scale-110 ring-2 ring-yellow-400 -translate-y-1' : 'hover:scale-105'}
            ${val === 10 ? 'bg-red-600 text-white border-2 border-dashed border-white' : ''}
            ${val === 50 ? 'bg-blue-600 text-white border-2 border-dashed border-white' : ''}
            ${val === 100 ? 'bg-green-600 text-white border-2 border-dashed border-white' : ''}
            ${val === 500 ? 'bg-black text-yellow-400 border-2 border-yellow-400' : ''}
            ${val === 1000 ? 'bg-purple-700 text-yellow-200 border-2 border-yellow-200' : ''}
          `}
        >
          {val}
        </button>
      ))}
    </div>
  );
};

export default ChipSelector;