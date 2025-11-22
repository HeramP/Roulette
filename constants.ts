// European Roulette Wheel Order (Clockwise starting from 0)
export const WHEEL_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

export const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
]);

export const BLACK_NUMBERS = new Set([
  2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35
]);

export enum BetType {
  STRAIGHT = 'STRAIGHT', // Single number
  RED = 'RED',
  BLACK = 'BLACK',
  EVEN = 'EVEN',
  ODD = 'ODD',
  LOW = 'LOW',   // 1-18
  HIGH = 'HIGH', // 19-36
  DOZEN_1 = '1st 12',
  DOZEN_2 = '2nd 12',
  DOZEN_3 = '3rd 12',
}

export const CHIP_VALUES = [10, 50, 100, 500, 1000];

export const PAYOUTS: Record<BetType, number> = {
  [BetType.STRAIGHT]: 35,
  [BetType.RED]: 1,
  [BetType.BLACK]: 1,
  [BetType.EVEN]: 1,
  [BetType.ODD]: 1,
  [BetType.LOW]: 1,
  [BetType.HIGH]: 1,
  [BetType.DOZEN_1]: 2,
  [BetType.DOZEN_2]: 2,
  [BetType.DOZEN_3]: 2,
};