import { BetType } from "./constants";

export interface Bet {
  id: string;
  type: BetType;
  value: number | string; // number for Straight up (0-36), string for others
  amount: number;
}

export interface GameState {
  balance: number;
  currentBets: Bet[];
  lastWin: number | null;
  history: number[];
  isSpinning: boolean;
  bettingHistory: Bet[]; // For 'Rebet' functionality
}

export interface WheelAnimationState {
    rotation: number; // Degrees
    transitionDuration: number; // Seconds
}