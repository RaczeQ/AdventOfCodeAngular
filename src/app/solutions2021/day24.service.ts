import { Injectable } from '@angular/core';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { isNumber } from '../helper/util-functions/is-number';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';
import { ArithmeticLogicUnitVisualizerComponent } from './components/arithmetic-logic-unit-visualizer/arithmetic-logic-unit-visualizer.component';

type Variable = 'w' | 'x' | 'y' | 'z';

@Injectable({
  providedIn: 'root',
})
export class Day24Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2021, 24, 'Arithmetic Logic Unit');
  }

  private splitInstructions(
    instructionGroups: string[][]
  ): [number | undefined, number | undefined][] {
    var result: [number | undefined, number | undefined][] = [];
    instructionGroups.forEach((group) => {
      if (group[4].split(' ')[2] == '1') {
        result.push([Number(group[15].split(' ')[2]), undefined]);
      } else {
        result.push([undefined, Number(group[5].split(' ')[2])]);
      }
    });
    return result;
  }

  private executeProgram(
    instructions: string[],
    digit: number,
    state: Map<Variable, number>
  ): Map<Variable, number> | undefined {
    for (let index = 0; index < instructions.length; index++) {
      const instruction = instructions[index];
      var segments = instruction.split(' ');
      var key = segments[1] as Variable;
      var value = isNumber(segments[2])
        ? Number(segments[2])
        : state.get(segments[2] as Variable)!;
      switch (segments[0]) {
        case 'inp': {
          state.set(segments[1] as Variable, digit);
          break;
        }
        case 'add': {
          state.set(key, state.get(key)! + value);
          break;
        }
        case 'mul': {
          state.set(key, state.get(key)! * value);
          break;
        }
        case 'div': {
          if (value == 0) {
            return undefined;
          }
          state.set(key, Math.floor(state.get(key)! / value));
          break;
        }
        case 'mod': {
          if (state.get(key)! < 0 || value <= 0) {
            return undefined;
          }
          state.set(key, state.get(key)! % value);
          break;
        }
        case 'eql': {
          state.set(key, state.get(key)! == value ? 1 : 0);
          break;
        }
      }
    }
    return state;
  }

  private groupInstructions(input: string): string[][] {
    var instructions = splitIntoLines(input);
    var instructionGroups: string[][] = [];
    instructions.forEach((instruction) => {
      if (instruction.includes('inp')) {
        instructionGroups.push([]);
      }
      instructionGroups.slice(-1)[0].push(instruction);
    });
    return instructionGroups;
  }

  // Copied from https://www.reddit.com/r/adventofcode/comments/rnejv5/comment/hqstr1a/?utm_source=share&utm_medium=web2x&context=3
  private findNumber(
    instructionGroups: string[][],
    biggest: boolean = true
  ): number {
    var monad = Array(14).fill(0);
    var stack: [number, number][] = [];
    var startDigit = biggest ? 9 : 1;
    this.splitInstructions(instructionGroups).forEach(([div1, div26], idx) => {
      if (div1 !== undefined) {
        stack.push([idx, div1]);
      } else {
        var [idxPrim, value] = stack.pop()!;
        var diff = value + div26!;
        if (biggest) {
          monad[idxPrim] = Math.min(startDigit, startDigit - diff);
          monad[idx] = Math.min(startDigit, startDigit + diff);
        } else {
          monad[idxPrim] = Math.max(startDigit, startDigit - diff);
          monad[idx] = Math.max(startDigit, startDigit + diff);
        }
      }
    });

    return Number(monad.map((n) => n.toString()).join(''));
  }

  override solvePart1(input: string): PuzzleResult {
    var instructionGroups = this.groupInstructions(input);
    var number = this.findNumber(instructionGroups, true);
    var nextState = new Map<Variable, number>([
      ['w', 0],
      ['x', 0],
      ['y', 0],
      ['z', 0],
    ]);
    var executedInstructions = instructionGroups.map((group, groupIndex) => {
      return group.map((instruction) => {
        nextState = this.executeProgram(
          [instruction],
          Number(number.toString()[groupIndex]),
          nextState
        )!;
        return [instruction, new Map(nextState!)] as [
          string,
          Map<string, number>
        ];
      });
    });
    return {
      result: number,
      component: ArithmeticLogicUnitVisualizerComponent,
      componentData: {
        instructions: executedInstructions,
        number: number.toString(),
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var instructionGroups = this.groupInstructions(input);
    var number = this.findNumber(instructionGroups, false);
    var nextState = new Map<Variable, number>([
      ['w', 0],
      ['x', 0],
      ['y', 0],
      ['z', 0],
    ]);
    var executedInstructions = instructionGroups.map((group, groupIndex) => {
      return group.map((instruction) => {
        nextState = this.executeProgram(
          [instruction],
          Number(number.toString()[groupIndex]),
          nextState
        )!;
        return [instruction, new Map(nextState!)] as [
          string,
          Map<string, number>
        ];
      });
    });
    return {
      result: number,
      component: ArithmeticLogicUnitVisualizerComponent,
      componentData: {
        instructions: executedInstructions,
        number: number.toString(),
      },
    };
  }
}
