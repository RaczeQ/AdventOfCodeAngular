import { Type } from '@angular/core';
import { BaseResultComponent } from '../components/base-result.component';

export interface PuzzleResult {
  result: string | number;
  component: Type<BaseResultComponent>;
  componentData: any;
}
export interface ISolutionService {
  solvePart1(
    input: string
  ):
    | number
    | string
    | PuzzleResult
    | Promise<number>
    | Promise<string>
    | Promise<PuzzleResult>;
  solvePart2(
    input: string
  ):
    | number
    | string
    | PuzzleResult
    | Promise<number>
    | Promise<string>
    | Promise<PuzzleResult>;
}
