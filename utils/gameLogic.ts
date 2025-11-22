import { BetType, PAYOUTS, RED_NUMBERS, BLACK_NUMBERS } from '../constants';
import { Bet } from '../types';

export const calculateWinnings = (winningNumber: number, bets: Bet[]): number => {
  let totalWinnings = 0;

  bets.forEach(bet => {
    let won = false;

    switch (bet.type) {
      case BetType.STRAIGHT:
        won = bet.value === winningNumber;
        break;
      case BetType.RED:
        won = RED_NUMBERS.has(winningNumber);
        break;
      case BetType.BLACK:
        won = BLACK_NUMBERS.has(winningNumber);
        break;
      case BetType.EVEN:
        won = winningNumber !== 0 && winningNumber % 2 === 0;
        break;
      case BetType.ODD:
        won = winningNumber !== 0 && winningNumber % 2 !== 0;
        break;
      case BetType.LOW:
        won = winningNumber >= 1 && winningNumber <= 18;
        break;
      case BetType.HIGH:
        won = winningNumber >= 19 && winningNumber <= 36;
        break;
      case BetType.DOZEN_1:
        won = winningNumber >= 1 && winningNumber <= 12;
        break;
      case BetType.DOZEN_2:
        won = winningNumber >= 13 && winningNumber <= 24;
        break;
      case BetType.DOZEN_3:
        won = winningNumber >= 25 && winningNumber <= 36;
        break;
      default:
        break;
    }

    if (won) {
      // Payout includes the original bet + winning amount
      totalWinnings += bet.amount + (bet.amount * PAYOUTS[bet.type]);
    }
  });

  return totalWinnings;
};