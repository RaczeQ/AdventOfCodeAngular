import { Injectable } from '@angular/core';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { Position } from '../helper/util-functions/astar';
import { Point2D, points2DEqual } from '../helper/util-functions/point';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';
import { BlizzardVisualizerComponent } from './components/blizzard-visualizer/blizzard-visualizer.component';
import { mod } from '../helper/util-functions/mod';
import { Queue } from '../helper/util-functions/queue';
import { lcm } from '../helper/util-functions/lcm';

export interface Blizzard extends Point2D {
  direction: string;
}

const directions: { [direction: string]: Point2D } = {
  S: { x: 0, y: 1 },
  E: { x: 1, y: 0 },
  N: { x: 0, y: -1 },
  W: { x: -1, y: 0 },
};

function parseValley(input: string): {
  valley: Position[];
  blizzards: Blizzard[];
  walls: Point2D[];
} {
  var walls: Point2D[] = splitIntoLines(input)
    .flatMap((line, y) =>
      line.split('').map((char, x) => {
        return char == '#' ? { x: x - 1, y: y - 1 } : null;
      })
    )
    .filter((position) => position != null)
    .map((position) => position as Point2D);
  var valley: Position[] = splitIntoLines(input)
    .flatMap((line, y) =>
      line.split('').map((char, x) => {
        return char != '#'
          ? { x: x - 1, y: y - 1, neighbours: [], value: 0 }
          : null;
      })
    )
    .filter((position) => position != null)
    .map((position) => position as Position);

  valley.forEach((position) =>
    Object.values(directions).forEach((direction) => {
      var neighbour = valley.find((pos) =>
        points2DEqual(pos, {
          x: position.x + direction.x,
          y: position.y + direction.y,
        })
      );
      if (neighbour !== undefined) {
        position.neighbours.push(neighbour);
      }
    })
  );

  var blizzards: Blizzard[] = splitIntoLines(input)
    .flatMap((line, y) =>
      line.split('').map((char, x) => {
        if (char == '#' || char == '.') {
          return null;
        }
        var direction = 'N';
        switch (char) {
          case '>':
            direction = 'E';
            break;
          case '<':
            direction = 'W';
            break;
          case '^':
            direction = 'N';
            break;
          case 'v':
            direction = 'S';
            break;
        }
        return { x: x - 1, y: y - 1, direction };
      })
    )
    .filter((position) => position != null)
    .map((position) => position as Blizzard);

  return { valley, blizzards, walls };
}

export function getCurrentBlizzardsPositions(
  blizzards: Blizzard[],
  currentTime: number,
  blizzardMaxX: number,
  blizzardMaxY: number,
  cache: { [time: number]: Point2D[] }
): Point2D[] {
  var timeModulo = currentTime % lcm(blizzardMaxX + 1, blizzardMaxY + 1);

  if (!Object.keys(cache).includes(timeModulo.toString())) {
    cache[timeModulo] = blizzards.map((blizzard) => {
      var x = mod(
        blizzard.x + directions[blizzard.direction].x * timeModulo,
        blizzardMaxX + 1
      );
      var y = mod(
        blizzard.y + directions[blizzard.direction].y * timeModulo,
        blizzardMaxY + 1
      );
      return { x, y };
    });
  }

  return cache[timeModulo];
}

function getBlizzardsHashMap(
  blizzards: Blizzard[],
  currentTime: number,
  blizzardMaxX: number,
  blizzardMaxY: number,
  cache: { [time: number]: Set<string> }
): Set<string> {
  var timeModulo = currentTime % lcm(blizzardMaxX + 1, blizzardMaxY + 1);

  if (!Object.keys(cache).includes(timeModulo.toString())) {
    cache[timeModulo] = new Set<string>(
      getCurrentBlizzardsPositions(
        blizzards,
        currentTime,
        blizzardMaxX,
        blizzardMaxY,
        {}
      ).map((pos) => `${pos.x}|${pos.y}`)
    );
  }

  return cache[timeModulo];
}

// Transcribed solution by u/Special_Freedom_8069 from Reddit help thread
// https://www.reddit.com/r/adventofcode/comments/zubqho/2022_day_24_why_bfs_not_dfs/
function moveThroughBlizzard(
  blizzards: Blizzard[],
  blizzardMaxX: number,
  blizzardMaxY: number,
  queue: Queue<[Position, number, Point2D[]]>,
  endPosition: Position,
  blizzardsCache: { [time: number]: Set<string> }
): Point2D[] {
  while (!queue.isEmpty()) {
    var [currentPosition, currentTime, moves] = queue.dequeue()!;
    if (points2DEqual(currentPosition, endPosition)) {
      return moves;
    }

    var newMoves = moves.concat(...[currentPosition]);

    var futureTime = currentTime + 1;
    var futureBlizzardState = getBlizzardsHashMap(
      blizzards,
      futureTime,
      blizzardMaxX,
      blizzardMaxY,
      blizzardsCache
    );

    // Add neighbours
    currentPosition.neighbours
      .filter(
        (neighbour) => !futureBlizzardState.has(`${neighbour.x}|${neighbour.y}`)
      )
      .forEach((neighbour) => {
        if (
          !queue.store.some(
            ([position, time]) =>
              points2DEqual(position, neighbour) && time == futureTime
          )
        ) {
          queue.enqueue([neighbour, futureTime, newMoves]);
        }
      });

    // Add wait time
    if (
      !futureBlizzardState.has(`${currentPosition.x}|${currentPosition.y}`) &&
      !queue.store.some(
        ([position, time]) =>
          points2DEqual(position, currentPosition) && time == futureTime
      )
    ) {
      queue.enqueue([currentPosition, futureTime, newMoves]);
    }
  }

  throw new Error('BFS exhausted');
}

@Injectable({
  providedIn: 'root',
})
export class Day24Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2022, 24, 'Blizzard Basin');
  }
  override solvePart1(input: string): PuzzleResult {
    var { valley, blizzards, walls } = parseValley(input);
    var startPosition = valley[0];
    var endPosition = valley[valley.length - 1];
    var blizzardMaxX = endPosition.x;
    var blizzardMaxY = endPosition.y - 1;
    var blizzardsCache = {};
    var queue = new Queue<[Position, number, Point2D[]]>();
    queue.enqueue([startPosition, 0, []]);
    var moves = moveThroughBlizzard(
      blizzards,
      blizzardMaxX,
      blizzardMaxY,
      queue,
      endPosition,
      blizzardsCache
    );
    return {
      result: moves.length,
      component: BlizzardVisualizerComponent,
      componentData: {
        moves: moves.concat(...[endPosition]),
        walls,
        blizzards,
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var { valley, blizzards, walls } = parseValley(input);
    var startPosition = valley[0];
    var endPosition = valley[valley.length - 1];
    var blizzardMaxX = endPosition.x;
    var blizzardMaxY = endPosition.y - 1;
    var blizzardsCache = {};
    var queue = new Queue<[Position, number, Point2D[]]>();
    queue.enqueue([startPosition, 0, []]);
    var moves = moveThroughBlizzard(
      blizzards,
      blizzardMaxX,
      blizzardMaxY,
      queue,
      endPosition,
      blizzardsCache
    );
    queue.clear();
    queue.enqueue([endPosition, moves.length, moves]);
    moves = moveThroughBlizzard(
      blizzards,
      blizzardMaxX,
      blizzardMaxY,
      queue,
      startPosition,
      blizzardsCache
    );
    queue.clear();
    queue.enqueue([startPosition, moves.length, moves]);
    moves = moveThroughBlizzard(
      blizzards,
      blizzardMaxX,
      blizzardMaxY,
      queue,
      endPosition,
      blizzardsCache
    );
    return {
      result: moves.length,
      component: BlizzardVisualizerComponent,
      componentData: {
        moves: moves.concat(...[endPosition]),
        walls,
        blizzards,
      },
    };
  }
}
