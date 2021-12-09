import { splitIntoLines } from './split-into-lines';

export function parseFirstLineIntoNumbers(input: string): number[] {
  return splitIntoLines(input)[0].split(',').map(Number);
}
