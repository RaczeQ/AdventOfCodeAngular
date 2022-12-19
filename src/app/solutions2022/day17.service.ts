import { Injectable } from '@angular/core';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { Point2D, points2DEqual } from '../helper/util-functions/point';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';
import { FallingRocksVisualizerComponent } from './components/falling-rocks-visualizer/falling-rocks-visualizer.component';

type Shape = number[][];

const SHAPE_LINE_HORIZONTAL: Shape = [[1, 1, 1, 1]];
const SHAPE_CROSS: Shape = [
  [0, 1, 0],
  [1, 1, 1],
  [0, 1, 0],
];
const SHAPE_L: Shape = [
  [1, 1, 1],
  [0, 0, 1],
  [0, 0, 1],
];
const SHAPE_LINE_VERTICAL: Shape = [[1], [1], [1], [1]];
const SHAPE_SQUARE: Shape = [
  [1, 1],
  [1, 1],
];

const SHAPES_QUEUE: Shape[] = [
  SHAPE_LINE_HORIZONTAL,
  SHAPE_CROSS,
  SHAPE_L,
  SHAPE_LINE_VERTICAL,
  SHAPE_SQUARE,
];

const TRANSPOSED_SHAPES_QUEUE: Shape[] = SHAPES_QUEUE.map((shape) =>
  shape[0].map((_, colIndex) => shape.map((row) => row[colIndex]))
);

const STARTING_HEIGHTS: number[] = [0, 0, 0, 0, 0, 0, 0];

export interface RockPosition {
  shape: Shape;
  position: Point2D;
  jetIdx: number;
}

function parseJets(input: string): number[] {
  return splitIntoLines(input, true)[0]
    .split('')
    .map((jet) => (jet == '<' ? -1 : 1));
}

function dropShape(
  blockedPositions: Point2D[],
  shape: Shape,
  transposedShape: Shape,
  jets: number[],
  jetIdx: number
): { shapePosition: Point2D; jetIdx: number }[] {
  var path: { shapePosition: Point2D; jetIdx: number }[] = [];
  var x = 2;
  // var y = Math.max(...heights) + 4;
  var y = Math.max(...blockedPositions.map((position) => position.y)) + 4;
  var rested = false;
  path.push({ shapePosition: { x, y }, jetIdx });
  while (!rested) {
    // Move by jet
    var newPosition = x + jets[jetIdx];
    if (
      newPosition >= 0 &&
      newPosition <= 7 - shape[0].length &&
      transposedShape.every((line, shapeX) =>
        line.every(
          (value, shapeY) =>
            value === 0 ||
            blockedPositions.findIndex((position) =>
              points2DEqual(position, {
                x: newPosition + shapeX,
                y: y + shapeY,
              })
            ) === -1
        )
      )
    ) {
      x = newPosition;
    }
    jetIdx = (jetIdx + 1) % jets.length;

    path.push({ shapePosition: { x, y }, jetIdx });

    // Move downward
    if (
      y > 0 &&
      shape.every((line, shapeY) =>
        line.every(
          (value, shapeX) =>
            value === 0 ||
            blockedPositions.findIndex((position) =>
              points2DEqual(position, {
                x: x + shapeX,
                y: y + shapeY - 1,
              })
            ) === -1
        )
      )
    ) {
      y -= 1;
    } else {
      rested = true;
    }
    path.push({ shapePosition: { x, y }, jetIdx });
  }
  return path;
}

function dropRocks(jets: number[], numberOfRocks: number): RockPosition[][] {
  var result: RockPosition[][] = [];
  var blockedPositions: Point2D[] = STARTING_HEIGHTS.map((value, x) => {
    return { x, y: value };
  });
  var jetIdx = 0;
  for (let index = 0; index < numberOfRocks; index++) {
    // Drop shape
    var shape = SHAPES_QUEUE[index % SHAPES_QUEUE.length];
    var transposedShape = TRANSPOSED_SHAPES_QUEUE[index % SHAPES_QUEUE.length];
    var shapePath = dropShape(
      blockedPositions,
      shape,
      transposedShape,
      jets,
      jetIdx
    );
    result.push(
      shapePath.map(({ shapePosition, jetIdx }) => {
        return { jetIdx, shape, position: shapePosition };
      })
    );

    var { shapePosition, jetIdx } = shapePath[shapePath.length - 1];

    // Update blocked positions
    shape.forEach((line, shapeY) =>
      line.forEach((value, shapeX) => {
        if (value === 1) {
          blockedPositions.push({
            x: shapePosition.x + shapeX,
            y: shapePosition.y + shapeY,
          });
        }
      })
    );
  }
  return result;
}

function findCycle(jets: number[]): {
  rockIdx: number;
  baseHeight: number;
  cycleMoves: RockPosition[];
  gainedHeights: number[];
  preGainedHeights: number[];
} {
  var result: RockPosition[] = [];
  var blockedPositions: Point2D[] = STARTING_HEIGHTS.map((value, x) => {
    return { x, y: value };
  });
  var jetIdx = 0;
  var index = 0;
  while (true) {
    // Drop shape
    var shape = SHAPES_QUEUE[index % SHAPES_QUEUE.length];
    var transposedShape = TRANSPOSED_SHAPES_QUEUE[index % SHAPES_QUEUE.length];
    var shapePath = dropShape(
      blockedPositions,
      shape,
      transposedShape,
      jets,
      jetIdx
    );

    var { shapePosition, jetIdx } = shapePath[shapePath.length - 1];

    // Check cycle

    var potentialCycleIndexes = result.reduce(function (
      a: number[],
      rockPosition,
      i
    ) {
      if (
        rockPosition.jetIdx === jetIdx &&
        rockPosition.position.x === shapePosition.x &&
        rockPosition.shape === shape
      )
        a.push(i);
      return a;
    },
    []);
    for (let i = 0; i < potentialCycleIndexes.length; i++) {
      const cycleIdx = potentialCycleIndexes[i];
      var cycleMoves = result.slice(cycleIdx);
      if (cycleIdx - cycleMoves.length < 0) {
        continue;
      }
      var previousCycleMoves = result.slice(
        cycleIdx - cycleMoves.length,
        cycleIdx
      );
      var isMatching = Array.range(0, cycleMoves.length).every(
        (cycleMoveId) =>
          previousCycleMoves[cycleMoveId].jetIdx ===
            cycleMoves[cycleMoveId].jetIdx &&
          previousCycleMoves[cycleMoveId].position.x ===
            cycleMoves[cycleMoveId].position.x
      );
      if (!isMatching) {
        continue;
      }
      var baseHeight = Math.max(
        ...result
          .slice(0, cycleIdx)
          .map((position) => position.position.y + position.shape.length)
      );
      var gainedHeights = cycleMoves.map((_, idx) =>
        Math.max(
          ...cycleMoves
            .slice(0, idx + 1)
            .map((position) =>
              Math.max(
                0,
                position.position.y + position.shape.length - baseHeight
              )
            )
        )
      );
      var previousMoves = result.slice(0, cycleIdx);
      return {
        rockIdx: cycleIdx,
        baseHeight,
        cycleMoves,
        gainedHeights,
        preGainedHeights: previousMoves.map((_, idx) =>
          Math.max(
            ...previousMoves
              .slice(0, idx + 1)
              .map((position) =>
                Math.max(0, position.position.y + position.shape.length)
              )
          )
        ),
      };
    }

    result.push({ jetIdx, shape, position: shapePosition });

    // Update blocked positions
    shape.forEach((line, shapeY) =>
      line.forEach((value, shapeX) => {
        if (value === 1) {
          blockedPositions.push({
            x: shapePosition.x + shapeX,
            y: shapePosition.y + shapeY,
          });
        }
      })
    );

    index++;
  }
}

@Injectable({
  providedIn: 'root',
})
export class Day17Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2022, 17, 'Pyroclastic Flow');
  }
  override solvePart1(input: string): PuzzleResult {
    var jets = parseJets(input);
    var rocksPositions = dropRocks(jets, 2022);
    var result =
      Math.max(
        ...rocksPositions.map((rockPositions) => {
          var lastPosition = rockPositions[rockPositions.length - 1];
          return lastPosition.position.y + lastPosition.shape.length;
        })
      ) - 1;
    return {
      result: result,
      component: FallingRocksVisualizerComponent,
      componentData: {
        jets,
        rocksPositions,
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var jets = parseJets(input);
    var res = findCycle(jets);

    var rocksLeft = 1000000000000 - res.rockIdx;
    var cycles = Math.floor(rocksLeft / res.cycleMoves.length);
    var cycleLeft = rocksLeft % res.cycleMoves.length;

    var result =
      res.baseHeight +
      cycles * res.gainedHeights[res.gainedHeights.length - 1] -
      1;
    if (cycleLeft > 0) {
      result += res.gainedHeights[cycleLeft - 1];
    }

    var preHeights: number[] = [];
    var preRocks: number[] = [];

    res.preGainedHeights.forEach((h, i) => {
      preHeights.push(h);
      preRocks.push(i + 1);
    });

    var heights: number[] = [];
    var rocks: number[] = [];

    res.gainedHeights.forEach((h, i) => {
      heights.push(h);
      rocks.push(i + 1);
    });

    return {
      result: result,
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            x: rocks,
            y: heights,
            legendgroup: 'base',
            name: 'Height gained before cycle',
          },
          {
            x: preRocks,
            y: preHeights,
            legendgroup: 'base',
            xaxis: 'x2',
            name: 'Height gained during repeated cycle',
          },
        ],
        graphLayout: {
          yaxis: { title: 'Height gained' },
          xaxis: { title: 'Rocks dropped before cycle', automargin: true },
          xaxis2: {
            title: 'Rocks dropped in a cycle',
            titlefont: { color: 'rgb(255, 255, 255)' },
            tickfont: { color: 'rgb(255, 255, 255)' },
            overlaying: 'x',
            side: 'top',
          },
        },
      },
    };
  }
}
