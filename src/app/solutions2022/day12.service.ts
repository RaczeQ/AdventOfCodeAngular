import { Injectable } from '@angular/core';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import {
  aStar,
  generatePositions,
  Position,
} from '../helper/util-functions/astar';
import { Point2D } from '../helper/util-functions/point';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';

function parseHeightmap(input: string): [number[][], Point2D, Point2D] {
  var start!: Point2D;
  var end!: Point2D;
  var heightmap = splitIntoLines(input).map((line, y) =>
    line.split('').map((character, x) => {
      if (character == 'S') {
        character = 'a';
        start = { x, y };
      } else if (character == 'E') {
        character = 'z';
        end = { x, y };
      }
      return character.charCodeAt(0) - 96;
    })
  );
  return [heightmap, start, end];
}

function filterNeighbours(positions: Position[], heightmap: number[][]): void {
  positions.forEach((position) => {
    position.neighbours = position.neighbours.filter(
      (neighbour) =>
        heightmap[neighbour.y][neighbour.x] <=
        heightmap[position.y][position.x] + 1
    );
  });
}

@Injectable({
  providedIn: 'root',
})
export class Day12Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2022, 12, 'Hill Climbing Algorithm');
  }
  override solvePart1(input: string): PuzzleResult {
    var [heightmap, start, end] = parseHeightmap(input);
    var height = heightmap.length;
    var width = heightmap[0].length;

    var xValues: number[] = [];
    var yValues: number[] = [];
    var zValues: number[] = [];
    heightmap.forEach((row, y) =>
      row.forEach((elevation, x) => {
        xValues.push(x);
        yValues.push(y);
        zValues.push(elevation);
      })
    );

    var fakeHeightmap = Array.range(0, height).map((y) =>
      Array.range(0, width).map((x) => 1)
    );
    var positions = generatePositions(fakeHeightmap);
    filterNeighbours(positions, heightmap);

    var startIdx = start.y * width + start.x;
    var endIdx = end.y * width + end.x;
    var { dist, parents } = aStar(positions, startIdx, endIdx);
    var path = [endIdx];
    while (
      path[path.length - 1] !== undefined &&
      path[path.length - 1] != startIdx
    ) {
      path.push(parents[path[path.length - 1]]!);
    }

    return {
      result: dist[endIdx],
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            z: heightmap,
            type: 'surface',
            contours: {
              z: {
                show: true,
                usecolormap: true,
                highlightcolor: '#42f462',
                project: { z: true },
              },
            },
            name: 'Hill',
          },
          {
            x: path.map((p) => p % width),
            y: path.map((p) => Math.floor(p / width)),
            z: path.map(
              (p) => heightmap[Math.floor(p / width)][p % width] + 0.01
            ),
            type: 'scatter3d',
            mode: 'lines',
            name: 'Path',
            opacity: 1,
            line: {
              width: 6,
              color: '#ffffff',
            },
          },
        ],
        graphLayout: {
          autosize: false,
          scene: {
            camera: {
              eye: { x: 0, y: 0, z: 2 },
              up: { x: 1, y: 0, z: 1 },
            },
            yaxis: { autorange: 'reversed' },
            aspectmode: 'data',
          },
        },
        graphConfig: {
          displayModeBar: false,
          staticPlot: false,
        },
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var [heightmap, start, end] = parseHeightmap(input);
    var height = heightmap.length;
    var width = heightmap[0].length;

    var startingPositions: number[] = [];

    var xValues: number[] = [];
    var yValues: number[] = [];
    var zValues: number[] = [];
    heightmap.forEach((row, y) =>
      row.forEach((elevation, x) => {
        xValues.push(x);
        yValues.push(y);
        zValues.push(elevation);
        if (elevation === 1) {
          startingPositions.push(y * width + x);
        }
      })
    );

    var fakeHeightmap = Array.range(0, height).map((y) =>
      Array.range(0, width).map((x) => 1)
    );
    var positions = generatePositions(fakeHeightmap);
    filterNeighbours(positions, heightmap);

    var bestDist = Number.MAX_VALUE;
    var bestParents: (number | undefined)[] = [];
    var bestStartIdx: number;

    var endIdx = end.y * width + end.x;

    startingPositions.forEach((startIdx) => {
      var { dist, parents } = aStar(positions, startIdx, endIdx);
      if (dist[endIdx] < bestDist) {
        bestDist = dist[endIdx];
        bestParents = parents;
        bestStartIdx = startIdx;
      }
    });

    var path = [endIdx];
    while (
      path[path.length - 1] !== undefined &&
      path[path.length - 1] != bestStartIdx!
    ) {
      path.push(bestParents[path[path.length - 1]]!);
    }

    return {
      result: bestDist,
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            z: heightmap,
            type: 'surface',
            contours: {
              z: {
                show: true,
                usecolormap: true,
                highlightcolor: '#42f462',
                project: { z: true },
              },
            },
            name: 'Hill',
          },
          {
            x: path.map((p) => p % width),
            y: path.map((p) => Math.floor(p / width)),
            z: path.map(
              (p) => heightmap[Math.floor(p / width)][p % width] + 0.01
            ),
            type: 'scatter3d',
            mode: 'lines',
            name: 'Path',
            opacity: 1,
            line: {
              width: 6,
              color: '#ffffff',
            },
          },
        ],
        graphLayout: {
          autosize: false,
          scene: {
            camera: {
              eye: { x: 0, y: 0, z: 2 },
              up: { x: 1, y: 0, z: 1 },
            },
            yaxis: { autorange: 'reversed' },
            aspectmode: 'data',
          },
        },
        graphConfig: {
          displayModeBar: false,
          staticPlot: false,
        },
      },
    };
  }
}
