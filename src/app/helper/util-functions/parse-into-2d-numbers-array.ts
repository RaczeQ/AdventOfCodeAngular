import { splitIntoLines } from './split-into-lines';

export function parseInto2DNumbersArray(input: string): number[][] {
  return splitIntoLines(input).map((line) => line.split('').map(Number));
}
