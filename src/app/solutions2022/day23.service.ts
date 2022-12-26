import { Injectable } from '@angular/core';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { Point2D, points2DEqual } from '../helper/util-functions/point';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';
import { ElvesMovesVisualizerComponent } from './components/elves-moves-visualizer/elves-moves-visualizer.component';

export interface MovingElf extends Point2D {
  nextPosition?: Point2D;
  positionsList: Point2D[];
  moveChanges: number[];
}

function parseElves(input: string): MovingElf[] {
  return splitIntoLines(input, true)
    .flatMap((line, y) =>
      line.split('').map((char, x) => {
        return char == '#'
          ? {
              x,
              y,
              positionsList: [{ x, y }],
              moveChanges: [],
            }
          : null;
      })
    )
    .filter((elf) => elf != null) as MovingElf[];
}

function isDirectionEmpty(
  currentElf: MovingElf,
  direction: Point2D,
  hashMap: Set<string>
): boolean {
  return !hashMap.has(
    `${currentElf.x + direction.x}|${currentElf.y + direction.y}`
  );
}

function moveElves(elves: MovingElf[], round: number) {
  var directions: { [direction: string]: Point2D } = {
    NW: { x: -1, y: -1 },
    W: { x: -1, y: 0 },
    SW: { x: -1, y: 1 },
    N: { x: 0, y: -1 },
    S: { x: 0, y: 1 },
    NE: { x: 1, y: -1 },
    E: { x: 1, y: 0 },
    SE: { x: 1, y: 1 },
  };

  var propositionsList: { direction: string; directionsToCheck: string[] }[] = [
    { direction: 'N', directionsToCheck: ['N', 'NE', 'NW'] },
    { direction: 'S', directionsToCheck: ['S', 'SE', 'SW'] },
    { direction: 'W', directionsToCheck: ['W', 'NW', 'SW'] },
    { direction: 'E', directionsToCheck: ['E', 'NE', 'SE'] },
  ];

  var hashMap = new Set<string>(elves.map((elf) => `${elf.x}|${elf.y}`));

  // First half
  var suggestedMoves: { [move: string]: number } = {};
  elves.forEach((elf) => {
    var emptyDirections: { [direction: string]: boolean } = {};
    Object.keys(directions).forEach(
      (direction) =>
        (emptyDirections[direction] = isDirectionEmpty(
          elf,
          directions[direction],
          hashMap
        ))
    );
    if (
      Object.keys(directions).every((direction) => emptyDirections[direction])
    ) {
      elf.nextPosition = undefined;
    } else {
      for (let index = 0; index < propositionsList.length; index++) {
        const proposition =
          propositionsList[(index + round) % propositionsList.length];
        if (
          proposition.directionsToCheck.every(
            (direction) => emptyDirections[direction]
          )
        ) {
          elf.nextPosition = {
            x: elf.x + directions[proposition.direction].x,
            y: elf.y + directions[proposition.direction].y,
          };
          break;
        }
      }
    }
    if (elf.nextPosition !== undefined) {
      var key = `${elf.nextPosition.x}|${elf.nextPosition.y}`;
      if (!Object.keys(suggestedMoves).includes(key)) {
        suggestedMoves[key] = 0;
      }
      suggestedMoves[key]++;
    }
  });

  // Second half
  elves.forEach((elf) => {
    if (elf.nextPosition !== undefined) {
      var key = `${elf.nextPosition.x}|${elf.nextPosition.y}`;
      if (suggestedMoves[key] == 1) {
        elf.x = elf.nextPosition.x;
        elf.y = elf.nextPosition.y;
      }
    }
    elf.nextPosition = undefined;
    elf.positionsList.push({ x: elf.x, y: elf.y });
    if (
      !points2DEqual(elf.positionsList[round], elf.positionsList[round + 1])
    ) {
      elf.moveChanges.push(round);
    }
  });
}

@Injectable({
  providedIn: 'root',
})
export class Day23Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2022, 23, 'Unstable Diffusion');
  }
  override solvePart1(input: string): PuzzleResult {
    var elves = parseElves(input);
    for (let round = 0; round < 10; round++) {
      moveElves(elves, round);
    }
    var xRange =
      Math.max(...elves.map((elf) => elf.x)) -
      Math.min(...elves.map((elf) => elf.x)) +
      1;
    var yRange =
      Math.max(...elves.map((elf) => elf.y)) -
      Math.min(...elves.map((elf) => elf.y)) +
      1;
    var result = xRange * yRange - elves.length;
    return {
      result: result,
      component: ElvesMovesVisualizerComponent,
      componentData: {
        elves,
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var elves = parseElves(input);
    var round = 0;
    do {
      moveElves(elves, round);
      round++;
    } while (
      elves.some(
        (elf) =>
          !points2DEqual(elf.positionsList[round], elf.positionsList[round - 1])
      )
    );
    return {
      result: round,
      component: ElvesMovesVisualizerComponent,
      componentData: {
        elves,
      },
    };
  }
}
