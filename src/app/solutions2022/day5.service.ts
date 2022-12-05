import { Injectable } from '@angular/core';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { Stack } from '../helper/util-functions/stack';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';
import { CargoVisualizerComponent } from './components/cargo-visualizer/cargo-visualizer.component';

export interface CargoMove {
  amount: number;
  from: number;
  to: number;
}

export interface CargoStep {
  before: Stack<string>[];
  during: Stack<string>[];
  after: Stack<string>[];
  movedCargo: Stack<string>;
}

export interface CargoSnapshot {
  move: CargoMove;
  steps: CargoStep[];
}

function parseInput(input: string): [Stack<string>[], CargoMove[]] {
  var parts = input.split('\n\n');
  var cargoLines = splitIntoLines(parts[0]).slice(0, -1).reverse();
  var moveLines = splitIntoLines(parts[1]);

  var stacks: Stack<string>[] = [];
  for (let i = 0; i < Math.ceil(cargoLines[0].length / 4); i++) {
    stacks.push(new Stack<string>());
  }

  cargoLines.forEach((line) => {
    line.match(/.{1,4}/g)?.forEach((element, idx) => {
      var matches = Array.from(element.matchAll(/\[([A-Z])\]/gs)).map(
        (match) => match[1]
      );
      if (matches.length > 0) {
        stacks[idx].push(matches[0]);
      }
    });
  });

  var moves: CargoMove[] = [];
  moveLines.forEach((line) => {
    var matches = Array.from(
      line.matchAll(/move (\d+) from (\d+) to (\d+)/gs)
    )[0];
    moves.push({
      amount: Number(matches[1]),
      from: Number(matches[2]),
      to: Number(matches[3]),
    });
  });
  return [stacks, moves];
}

@Injectable({
  providedIn: 'root',
})
export class Day5Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2022, 5, 'Supply Stacks');
  }
  override solvePart1(input: string): PuzzleResult {
    var [stacks, moves] = parseInput(input);

    var snapshots: CargoSnapshot[] = [];

    moves.forEach((move) => {
      var moveSnapshot: CargoSnapshot = {
        move,
        steps: [],
      };
      for (let i = 0; i < move.amount; i++) {
        var stateBefore = stacks.map((s) => s.copy());
        var movedCargo: string = stacks[move.from - 1].pop()!;
        var stateDuring = stacks.map((s) => s.copy());
        stacks[move.to - 1].push(movedCargo);
        var stateAfter = stacks.map((s) => s.copy());
        moveSnapshot.steps.push({
          after: stateAfter,
          before: stateBefore,
          during: stateDuring,
          movedCargo: new Stack<string>(1, [movedCargo]),
        });
      }
      snapshots.push(moveSnapshot);
    });

    return {
      result: stacks.map((s) => s.peek()!).join(''),
      component: CargoVisualizerComponent,
      componentData: {
        snapshots,
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var [stacks, moves] = parseInput(input);

    var snapshots: CargoSnapshot[] = [];

    var cargoTemporalStack = new Stack<string>();
    moves.forEach((move) => {
      var moveSnapshot: CargoSnapshot = {
        move,
        steps: [],
      };
      var stateBefore = stacks.map((s) => s.copy());
      for (let i = 0; i < move.amount; i++) {
        cargoTemporalStack.push(stacks[move.from - 1].pop()!);
      }
      var movedCargo = cargoTemporalStack.copy();
      var stateDuring = stacks.map((s) => s.copy());
      for (let i = 0; i < move.amount; i++) {
        stacks[move.to - 1].push(cargoTemporalStack.pop()!);
      }
      var stateAfter = stacks.map((s) => s.copy());
      moveSnapshot.steps.push({
        after: stateAfter,
        before: stateBefore,
        during: stateDuring,
        movedCargo: movedCargo,
      });
      snapshots.push(moveSnapshot);
    });

    return {
      result: stacks.map((s) => s.peek()!).join(''),
      component: CargoVisualizerComponent,
      componentData: {
        snapshots,
      },
    };
  }
}
