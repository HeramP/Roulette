import React, { useEffect, useRef, useState, useMemo } from 'react';
import { WHEEL_NUMBERS, RED_NUMBERS } from '../constants';

interface RouletteWheelProps {
  winningNumber: number | null;
  isSpinning: boolean;
  onSpinComplete: () => void;
}

const WHEEL_SIZE = 300;
const RADIUS = WHEEL_SIZE / 2;
const SLICE_ANGLE = 360 / 37;

const RouletteWheel: React.FC<RouletteWheelProps> = ({ winningNumber, isSpinning, onSpinComplete }) => {
  const [wheelRotation, setWheelRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);
  
  // Calculate slice paths
  const getSlicePath = (index: number) => {
    const startAngle = (index * SLICE_ANGLE) - 90 - (SLICE_ANGLE / 2);
    const endAngle = ((index + 1) * SLICE_ANGLE) - 90 - (SLICE_ANGLE / 2);

    const x1 = RADIUS + RADIUS * Math.cos(Math.PI * startAngle / 180);
    const y1 = RADIUS + RADIUS * Math.sin(Math.PI * startAngle / 180);
    const x2 = RADIUS + RADIUS * Math.cos(Math.PI * endAngle / 180);
    const y2 = RADIUS + RADIUS * Math.sin(Math.PI * endAngle / 180);

    return `M ${RADIUS} ${RADIUS} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 0 1 ${x2} ${y2} Z`;
  };

  // Separate slices and labels to ensure text is always rendered ON TOP of all slices (Layering)
  const { slices, labels } = useMemo(() => {
    const s = [];
    const l = [];

    for (let i = 0; i < WHEEL_NUMBERS.length; i++) {
      const num = WHEEL_NUMBERS[i];
      const isRed = RED_NUMBERS.has(num);
      const isZero = num === 0;

      // Path Fill Color - Slightly lighter black #262626 for better contrast
      const fillColor = isZero ? '#16a34a' : isRed ? '#dc2626' : '#262626';
      
      s.push(
        <path
          key={`slice-${num}`}
          d={getSlicePath(i)}
          fill={fillColor}
          stroke="#fbbf24"
          strokeWidth="0.5"
        />
      );

      // Label math
      const angleDeg = (i * SLICE_ANGLE) - 90;
      const angleRad = Math.PI * angleDeg / 180;
      const tx = RADIUS + (RADIUS * 0.85) * Math.cos(angleRad);
      const ty = RADIUS + (RADIUS * 0.85) * Math.sin(angleRad);
      
      // Rotate text to align with radius
      // We rotate the text by the slice angle + 90 degrees so numbers face center
      const rotateVal = i * SLICE_ANGLE;

      l.push(
        <text
          key={`text-${num}`}
          x={tx}
          y={ty}
          fill="white"
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
          alignmentBaseline="central"
          // Rotate around the text position (tx, ty)
          transform={`rotate(${rotateVal + 90}, ${tx}, ${ty})`}
          style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.8)' }}
        >
          {num}
        </text>
      );
    }
    return { slices: s, labels: l };
  }, []);

  useEffect(() => {
    if (isSpinning && winningNumber !== null) {
      const winningIndex = WHEEL_NUMBERS.indexOf(winningNumber);
      const baseRotation = winningIndex * SLICE_ANGLE;
      const extraSpins = 5 * 360; 
      
      const currentRot = wheelRotation % 360;
      const newRotation = wheelRotation + (extraSpins + (360 - currentRot) - baseRotation);

      setWheelRotation(newRotation);

      const timer = setTimeout(() => {
        onSpinComplete();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isSpinning, winningNumber]);

  return (
    <div className="relative flex justify-center items-center py-8 overflow-hidden">
      {/* Outer Bezel */}
      <div className="relative rounded-full bg-amber-800 p-2 shadow-2xl border-4 border-amber-900 shadow-inner" style={{ width: WHEEL_SIZE + 20, height: WHEEL_SIZE + 20 }}>
        
        {/* The Rotating Wheel */}
        <div 
          ref={wheelRef}
          className="w-full h-full rounded-full transition-transform ease-out"
          style={{ 
            transform: `rotate(${wheelRotation}deg)`,
            transitionDuration: isSpinning ? '4s' : '0s',
            transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)' 
          }}
        >
          <svg viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`} className="w-full h-full rounded-full transform rotate-0">
            {/* Render Slices First (Background) */}
            <g className="origin-center">
              {slices}
            </g>
            
            {/* Render Labels Second (Foreground) - Guarantees visibility */}
            <g className="origin-center">
              {labels}
            </g>

            {/* Center decoration */}
            <circle cx={RADIUS} cy={RADIUS} r={RADIUS * 0.4} fill="#1e293b" stroke="#fbbf24" strokeWidth="2" />
            <circle cx={RADIUS} cy={RADIUS} r={RADIUS * 0.05} fill="#f59e0b" />
            <circle cx={RADIUS} cy={RADIUS} r={RADIUS * 0.25} fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.5" />
          </svg>
        </div>

        {/* The Ball Layer */}
        <div className="absolute inset-0 pointer-events-none z-10">
           {isSpinning && (
              <div className="absolute w-full h-full animate-ball-spin">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-md animate-ball-drop shadow-white/50"></div>
              </div>
           )}
           
           {!isSpinning && winningNumber !== null && (
               <div className="absolute top-[14%] left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-md shadow-white/50"></div>
           )}
        </div>

        {/* Reflection */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
      </div>
      
      {/* Pointer */}
      <div className="absolute top-4 z-20">
        <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[16px] border-t-yellow-400 drop-shadow-lg"></div>
      </div>

      <style>{`
        @keyframes ballSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-1440deg); } 
        }
        @keyframes ballDrop {
          0% { top: 4%; }
          60% { top: 4%; }
          100% { top: 14%; } 
        }
        .animate-ball-spin {
          animation: ballSpin 4s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
        }
        .animate-ball-drop {
          animation: ballDrop 4s cubic-bezier(0.55, 0.055, 0.675, 0.19) forwards;
        }
      `}</style>
    </div>
  );
};

export default RouletteWheel;