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
import { FallingSandVisualizerComponent } from './components/falling-sand-visualizer/falling-sand-visualizer.component';

function parseRocks(input: string): Point2D[] {
  var result: Point2D[] = [];
  splitIntoLines(input, true).forEach((line) => {
    var points = line.split(' -> ').map((pair) => {
      var coords = pair.split(',');
      return { x: Number(coords[0]), y: Number(coords[1]) };
    });
    Array.range(0, points.length - 1).forEach((index) => {
      const firstPoint = points[index];
      const secondPoint = points[index + 1];
      Array.range(
        Math.min(firstPoint.y, secondPoint.y),
        Math.max(firstPoint.y, secondPoint.y) + 1
      ).forEach((y) => {
        Array.range(
          Math.min(firstPoint.x, secondPoint.x),
          Math.max(firstPoint.x, secondPoint.x) + 1
        ).forEach((x) => {
          var newPoint = { x, y };
          if (!result.some((pt) => points2DEqual(pt, newPoint))) {
            result.push(newPoint);
          }
        });
      });
    });
  });
  return result;
}

function getFallPosition(
  sandGrain: Point2D,
  hashMap: Set<string>
): Point2D | undefined {
  var availablePositions: Point2D[] = [
    { x: sandGrain.x, y: sandGrain.y + 1 },
    { x: sandGrain.x - 1, y: sandGrain.y + 1 },
    { x: sandGrain.x + 1, y: sandGrain.y + 1 },
  ];
  return availablePositions.find((p) => !hashMap.has(`${p.x}|${p.y}`));
}

function fallSand(
  maxY: number,
  hashMap: Set<string>,
  startPath: Point2D[]
): Point2D[] {
  var result: Point2D[] = startPath;
  while (result[result.length - 1].y <= maxY) {
    var newPosition = getFallPosition(result[result.length - 1], hashMap);
    if (newPosition === undefined) {
      return result;
    }
    result.push(newPosition);
  }
  return result;
}

@Injectable({
  providedIn: 'root',
})
export class Day14Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2022, 14, 'Regolith Reservoir');
  }
  override solvePart1(input: string): PuzzleResult {
    var startPoint: Point2D = { x: 500, y: 0 };
    var rocks = parseRocks(input);
    var maxY = Math.max(...rocks.map((p) => p.y));
    var sand: Point2D[] = [];
    var snapshots: Point2D[][] = [[]];
    var sandPath = [startPoint];
    var hashMap = new Set<string>(rocks.map((p) => `${p.x}|${p.y}`));
    do {
      sandPath = fallSand(maxY, hashMap, sandPath);
      sandPath.forEach((sandPosition) => {
        snapshots.push(sand.concat([sandPosition]));
      });
      var newSandGrain = sandPath.pop()!;
      hashMap.add(`${newSandGrain.x}|${newSandGrain.y}`);
      sand.push(newSandGrain);
    } while (sand[sand.length - 1].y < maxY);
    return {
      result: sand.length - 1,
      component: FallingSandVisualizerComponent,
      componentData: {
        rocks,
        sands: snapshots,
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var startPoint: Point2D = { x: 500, y: 0 };
    var rocks = parseRocks(input);
    var maxY = Math.max(...rocks.map((p) => p.y));
    var sand: Point2D[] = [];
    var pathsLengths: number[] = [];
    var sandPath = [startPoint];
    var hashMap = new Set<string>(rocks.map((p) => `${p.x}|${p.y}`));
    do {
      sandPath = fallSand(maxY, hashMap, sandPath);
      pathsLengths.push(sandPath.length);
      var newSandGrain = sandPath.pop()!;
      hashMap.add(`${newSandGrain.x}|${newSandGrain.y}`);
      sand.push(newSandGrain);
    } while (sand[sand.length - 1].y > 0);
    return {
      result: sand.length,
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            x: pathsLengths.map((val, idx) => idx + 1),
            y: pathsLengths,
            type: 'bar',
            marker: { color: '#fad02c' },
          },
        ],
        graphLayout: {
          yaxis: { title: 'Path length' },
          xaxis: { title: 'Sand grains', automargin: true },
        },
      },
    };
  }
}
