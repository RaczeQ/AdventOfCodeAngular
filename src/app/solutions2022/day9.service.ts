import { Injectable } from '@angular/core';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { Point2D } from '../helper/util-functions/point';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';
import { RopeBridgeVisualizerComponent } from './components/rope-bridge-visualizer/rope-bridge-visualizer.component';

export enum Direction {
  U = 'U',
  D = 'D',
  L = 'L',
  R = 'R',
}

export interface RopeMove {
  direction: Direction;
  distance: number;
}

function parseRopeMove(move: string): RopeMove {
  var parts = move.split(' ');
  return {
    direction: parts[0] as Direction,
    distance: Number(parts[1]),
  };
}

function generateHeadMoves(
  input: string
): { move: RopeMove; position: Point2D }[] {
  var moves = splitIntoLines(input).map(parseRopeMove);
  var head: Point2D = { x: 0, y: 0 };
  var result: { move: RopeMove; position: Point2D }[] = [
    {
      move: moves[0],
      position: { x: head.x, y: head.y },
    },
  ];
  moves.forEach((move) => {
    for (let index = 0; index < move.distance; index++) {
      switch (move.direction) {
        case Direction.U:
          head.y += 1;
          break;
        case Direction.D:
          head.y -= 1;
          break;
        case Direction.L:
          head.x -= 1;
          break;
        case Direction.R:
          head.x += 1;
          break;
      }
      result.push({
        move: {
          direction: move.direction,
          distance: move.distance - index,
        },
        position: { x: head.x, y: head.y },
      });
    }
  });
  return result;
}

function generateTailMoves(input: Point2D[]): Point2D[] {
  var tail: Point2D = { x: 0, y: 0 };
  var result: Point2D[] = [{ x: tail.x, y: tail.y }];
  input.slice(1).forEach((head) => {
    var xDiff = head.x - tail.x;
    var yDiff = head.y - tail.y;
    if (Math.max(Math.abs(xDiff), Math.abs(yDiff)) > 1) {
      tail.x += Math.sign(xDiff);
      tail.y += Math.sign(yDiff);
    }
    result.push({ x: tail.x, y: tail.y });
  });
  return result;
}

@Injectable({
  providedIn: 'root',
})
export class Day9Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2022, 9, 'Rope Bridge');
  }
  override solvePart1(input: string): PuzzleResult {
    var headMoves = generateHeadMoves(input);
    var tailMoves = generateTailMoves(headMoves.map((m) => m.position));
    var uniquePositions = new Set(tailMoves.map((p) => `${p.x}|${p.y}`));
    return {
      result: uniquePositions.size,
      component: RopeBridgeVisualizerComponent,
      componentData: {
        headMoves: headMoves,
        knotsMoves: [tailMoves],
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var headMoves = generateHeadMoves(input);
    var knotsMoves: Point2D[][] = [];
    Array.range(0, 9).map((idx) => {
      let moves: Point2D[] = [];
      if (idx === 0) {
        moves = headMoves.map((m) => m.position);
      } else {
        moves = knotsMoves[idx - 1];
      }
      knotsMoves.push(generateTailMoves(moves));
    });
    var uniquePositions = new Set(knotsMoves[8].map((p) => `${p.x}|${p.y}`));
    return {
      result: uniquePositions.size,
      component: RopeBridgeVisualizerComponent,
      componentData: {
        headMoves: headMoves,
        knotsMoves: knotsMoves,
      },
    };
  }
}
