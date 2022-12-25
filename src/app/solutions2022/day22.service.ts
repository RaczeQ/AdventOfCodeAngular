import { Injectable } from '@angular/core';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { isNumber } from '../helper/util-functions/is-number';
import { Point2D, points2DEqual } from '../helper/util-functions/point';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';
import { MonkeyMapCubeVisualizerComponent } from './components/monkey-map-cube-visualizer/monkey-map-cube-visualizer.component';

export interface Tile extends Point2D {
  isWall: boolean;
}

export interface EdgeTile extends Point2D {
  facing: number;
  reversedFacing: number;
  neighbour?: EdgeTile;
}

type CubeFacesDirection = 'Front' | 'Back' | 'Up' | 'Down' | 'Left' | 'Right';

const SMALL_CUBE_FACES = [
  {
    xSrcRange: [8, 11],
    ySrcRange: [0, 0],
    xDstRange: [3, 0],
    yDstRange: [4, 4],
    srcFacing: 3,
    dstFacing: 3,
  },
  {
    xSrcRange: [11, 11],
    ySrcRange: [0, 3],
    xDstRange: [15, 15],
    yDstRange: [11, 8],
    srcFacing: 0,
    dstFacing: 0,
  },
  {
    xSrcRange: [11, 11],
    ySrcRange: [4, 7],
    xDstRange: [15, 12],
    yDstRange: [8, 8],
    srcFacing: 0,
    dstFacing: 3,
  },
  {
    xSrcRange: [12, 15],
    ySrcRange: [11, 11],
    xDstRange: [0, 0],
    yDstRange: [7, 4],
    srcFacing: 1,
    dstFacing: 2,
  },
  {
    xSrcRange: [8, 11],
    ySrcRange: [11, 11],
    xDstRange: [3, 0],
    yDstRange: [7, 7],
    srcFacing: 1,
    dstFacing: 1,
  },
  {
    xSrcRange: [8, 8],
    ySrcRange: [8, 11],
    xDstRange: [7, 4],
    yDstRange: [7, 7],
    srcFacing: 2,
    dstFacing: 1,
  },
  {
    xSrcRange: [8, 8],
    ySrcRange: [0, 3],
    xDstRange: [4, 7],
    yDstRange: [4, 4],
    srcFacing: 2,
    dstFacing: 3,
  },
];

const BIG_CUBE_FACES = [
  {
    xSrcRange: [50, 99],
    ySrcRange: [0, 0],
    xDstRange: [0, 0],
    yDstRange: [150, 199],
    srcFacing: 3,
    dstFacing: 2,
  },
  {
    xSrcRange: [100, 149],
    ySrcRange: [0, 0],
    xDstRange: [0, 49],
    yDstRange: [199, 199],
    srcFacing: 3,
    dstFacing: 1,
  },
  {
    xSrcRange: [149, 149],
    ySrcRange: [0, 49],
    xDstRange: [99, 99],
    yDstRange: [149, 100],
    srcFacing: 0,
    dstFacing: 0,
  },
  {
    xSrcRange: [100, 149],
    ySrcRange: [49, 49],
    xDstRange: [99, 99],
    yDstRange: [50, 99],
    srcFacing: 1,
    dstFacing: 0,
  },
  {
    xSrcRange: [50, 99],
    ySrcRange: [149, 149],
    xDstRange: [49, 49],
    yDstRange: [150, 199],
    srcFacing: 1,
    dstFacing: 0,
  },
  {
    xSrcRange: [50, 50],
    ySrcRange: [50, 99],
    xDstRange: [0, 49],
    yDstRange: [100, 100],
    srcFacing: 2,
    dstFacing: 3,
  },
  {
    xSrcRange: [50, 50],
    ySrcRange: [0, 49],
    xDstRange: [0, 0],
    yDstRange: [149, 100],
    srcFacing: 2,
    dstFacing: 2,
  },
];

const directions: Point2D[] = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
];

function parseMonkeyMap2D(input: string): Tile[] {
  return splitIntoLines(input.split('\n\n')[0], false).flatMap((line, y) =>
    line
      .split('')
      .map((character, x) => {
        if (character != ' ') {
          return {
            x,
            y,
            isWall: character == '#',
          };
        } else {
          return null;
        }
      })
      .filter((tile) => tile != null)
      .map((tile) => tile as Tile)
  );
}

function turn(facing: number, turn: 'L' | 'R'): number {
  var nextFacing = facing;
  if (turn == 'L') {
    nextFacing = facing - 1;
    if (nextFacing < 0) nextFacing = 3;
  } else if (turn == 'R') {
    nextFacing = facing + 1;
    if (nextFacing > 3) nextFacing = 0;
  }
  return nextFacing;
}

function getEdges(map: Tile[]): EdgeTile[] {
  var maxY = Math.max(...map.map((tile) => tile.y));
  var scale = 4;
  if (maxY > 16) {
    scale = 50;
  }
  var edgesBlueprint = scale == 50 ? BIG_CUBE_FACES : SMALL_CUBE_FACES;
  return edgesBlueprint!.flatMap((blueprint) => {
    var srcEdges: EdgeTile[] = (
      blueprint.ySrcRange[0] <= blueprint.ySrcRange[1]
        ? Array.range(blueprint.ySrcRange[0], blueprint.ySrcRange[1] + 1)
        : Array.range(
            blueprint.ySrcRange[1],
            blueprint.ySrcRange[0] + 1
          ).reverse()
    ).flatMap((y) =>
      (blueprint.xSrcRange[0] <= blueprint.xSrcRange[1]
        ? Array.range(blueprint.xSrcRange[0], blueprint.xSrcRange[1] + 1)
        : Array.range(
            blueprint.xSrcRange[1],
            blueprint.xSrcRange[0] + 1
          ).reverse()
      ).map((x) => {
        return {
          x,
          y,
          facing: blueprint.srcFacing,
          reversedFacing: (blueprint.srcFacing + 2) % 4,
        };
      })
    );
    var dstEdges: EdgeTile[] = (
      blueprint.yDstRange[0] <= blueprint.yDstRange[1]
        ? Array.range(blueprint.yDstRange[0], blueprint.yDstRange[1] + 1)
        : Array.range(
            blueprint.yDstRange[1],
            blueprint.yDstRange[0] + 1
          ).reverse()
    ).flatMap((y) =>
      (blueprint.xDstRange[0] <= blueprint.xDstRange[1]
        ? Array.range(blueprint.xDstRange[0], blueprint.xDstRange[1] + 1)
        : Array.range(
            blueprint.xDstRange[1],
            blueprint.xDstRange[0] + 1
          ).reverse()
      ).map((x) => {
        return {
          x,
          y,
          facing: blueprint.dstFacing,
          reversedFacing: (blueprint.dstFacing + 2) % 4,
        };
      })
    );
    for (let index = 0; index < srcEdges.length; index++) {
      srcEdges[index].neighbour = dstEdges[index];
      dstEdges[index].neighbour = srcEdges[index];
    }
    return srcEdges.concat(...dstEdges);
  });
}

function parsePath(input: string): (string | number)[] {
  var result = [];
  var line = input.split('\n\n')[1];
  var patt = /[LR]/gm;
  var match;
  var matches = [];
  var previousIdx = 0;
  while ((match = patt.exec(line))) {
    matches.push(match.index);
  }
  matches.forEach((matchIdx) => {
    result.push(Number(line.slice(previousIdx, matchIdx)));
    result.push(line[matchIdx]);
    previousIdx = matchIdx + 1;
  });
  if (previousIdx < line.length) {
    result.push(Number(line.slice(previousIdx)));
  }
  return result;
}

function moveOnMap(
  map: Tile[],
  path: (string | number)[],
  edges: EdgeTile[] = []
): { tile: Tile; facing: number }[] {
  var result: { tile: Tile; facing: number }[] = [];
  var facing = 0;
  var currentPosition = map[0];
  result.push({ facing, tile: currentPosition });
  path.forEach((move) => {
    if (isNumber(move)) {
      for (let index = 0; index < move; index++) {
        var nextFacing = -1;
        var edgeTile = edges.find(
          (edge) =>
            points2DEqual(edge, currentPosition) && edge.facing == facing
        );
        if (edgeTile !== undefined) {
          var nextPosition = {
            x: edgeTile.neighbour!.x,
            y: edgeTile.neighbour!.y,
          };
          nextFacing = edgeTile.neighbour!.reversedFacing;
        } else {
          var nextPosition = {
            x: currentPosition.x + directions[facing].x,
            y: currentPosition.y + directions[facing].y,
          };
        }
        if (!map.some((tile) => points2DEqual(tile, nextPosition))) {
          switch (facing) {
            case 0:
              nextPosition = {
                x: Math.min(
                  ...map
                    .filter((tile) => tile.y === nextPosition.y)
                    .map((tile) => tile.x)
                ),
                y: nextPosition.y,
              };
              break;
            case 1:
              nextPosition = {
                y: Math.min(
                  ...map
                    .filter((tile) => tile.x === nextPosition.x)
                    .map((tile) => tile.y)
                ),
                x: nextPosition.x,
              };
              break;
            case 2:
              nextPosition = {
                x: Math.max(
                  ...map
                    .filter((tile) => tile.y === nextPosition.y)
                    .map((tile) => tile.x)
                ),
                y: nextPosition.y,
              };
              break;
            case 3:
              nextPosition = {
                y: Math.max(
                  ...map
                    .filter((tile) => tile.x === nextPosition.x)
                    .map((tile) => tile.y)
                ),
                x: nextPosition.x,
              };
              break;
          }
        }
        var nextTile = map.find((tile) => points2DEqual(tile, nextPosition))!;
        if (!nextTile.isWall) {
          currentPosition = nextTile;
          if (nextFacing >= 0) facing = nextFacing;
          result.push({ facing, tile: currentPosition });
        }
      }
    } else {
      facing = turn(facing, move as 'L' | 'R');
      result.push({ facing, tile: currentPosition });
    }
  });
  return result;
}

@Injectable({
  providedIn: 'root',
})
export class Day22Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2022, 22, 'Monkey Map');
  }
  override solvePart1(input: string): PuzzleResult {
    var map = parseMonkeyMap2D(input);
    var path = parsePath(input);
    var executedMoves = moveOnMap(map, path);
    var lastPosition = executedMoves[executedMoves.length - 1];
    var result =
      1000 * (lastPosition.tile.y + 1) +
      4 * (lastPosition.tile.x + 1) +
      lastPosition.facing;
    return {
      result: result,
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            x: map.map((tile) => tile.x),
            y: map.map((tile) => tile.y),
            z: map.map((tile) =>
              tile.isWall
                ? 0
                : executedMoves.some((move) => points2DEqual(move.tile, tile))
                ? 1
                : 0.5
            ),
            colorscale: [
              ['0.0', '#000'],
              ['0.5', 'rgba(255,255,255,0.25)'],
              ['1.0', '#fad02c'],
            ],
            type: 'heatmap',
            colorbar: {
              tickfont: {
                color: '#ffffff',
              },
            },
            showscale: false,
          },
        ],
        graphLayout: {
          yaxis: {
            title: 'Y',
            autorange: 'reversed',
          },
          xaxis: {
            title: 'X',
            automargin: true,
            scaleanchor: 'y',
          },
        },
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var map = parseMonkeyMap2D(input);
    var path = parsePath(input);
    var edges = getEdges(map);
    var executedMoves = moveOnMap(map, path, edges);
    var lastPosition = executedMoves[executedMoves.length - 1];
    var result =
      1000 * (lastPosition.tile.y + 1) +
      4 * (lastPosition.tile.x + 1) +
      lastPosition.facing;
    return {
      result: result,
      component: MonkeyMapCubeVisualizerComponent,
      componentData: {
        map,
        executedMoves,
      },
    };
  }
}
