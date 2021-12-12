import { Injectable } from '@angular/core';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { parseInto2DNumbersArray } from '../helper/util-functions/parse-into-2d-numbers-array';
import { OctopusFlashesVisualizerComponent } from './components/octopus-flashes-visualizer/octopus-flashes-visualizer.component';

@Injectable({
  providedIn: 'root',
})
export class Day11Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2021, 11, 'Dumbo Octopus');
  }
  override solvePart1(input: string): PuzzleResult {
    var octopuses = parseInto2DNumbersArray(input);
    var maxX = octopuses[0].length;
    var maxY = octopuses.length;
    var directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];
    var snapshots = [
      octopuses.map(function (arr) {
        return arr.slice();
      }),
    ];
    var flashes: number[] = [];
    var steps = 100;
    for (let i = 0; i < steps; i++) {
      // Raise all
      var duplicatedArray = octopuses.map(function (arr) {
        return arr.slice();
      });
      duplicatedArray.forEach((row, y) => {
        row.forEach((val, x) => {
          octopuses[y][x]++;
        });
      });
      // Raise neighbours
      var flashed: string[] = [];
      while (
        octopuses.some((row, y) =>
          row.some(
            (num, x) =>
              num > 9 && !flashed.includes(x.toString() + '_' + y.toString())
          )
        )
      ) {
        duplicatedArray = octopuses.map(function (arr) {
          return arr.slice();
        });
        duplicatedArray.forEach((row, y) => {
          row.forEach((val, x) => {
            if (
              val > 9 &&
              !flashed.includes(x.toString() + '_' + y.toString())
            ) {
              flashed.push(x.toString() + '_' + y.toString());
              directions.forEach((d) => {
                var nX = x + d[0];
                var nY = y + d[1];
                if (nX >= 0 && nX < maxX && nY >= 0 && nY < maxY) {
                  octopuses[nY][nX]++;
                }
              });
            }
          });
        });
      }
      // Sum flashes
      flashes.push(flashed.length);
      // Resets
      duplicatedArray = octopuses.map(function (arr) {
        return arr.slice();
      });
      duplicatedArray.forEach((row, y) => {
        row.forEach((val, x) => {
          if (val > 9) {
            octopuses[y][x] = 0;
          }
        });
      });
      snapshots.push(
        octopuses.map(function (arr) {
          return arr.slice();
        })
      );
    }
    return {
      result: flashes.reduce((a, b) => a + b),
      component: OctopusFlashesVisualizerComponent,
      componentData: {
        snapshots: snapshots,
        flashes: flashes,
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var octopuses = parseInto2DNumbersArray(input);
    var maxX = octopuses[0].length;
    var maxY = octopuses.length;
    var directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];
    var allFlashedStep = 0;
    var currentStep = 0;
    var snapshots = [
      octopuses.map(function (arr) {
        return arr.slice();
      }),
    ];
    var flashes: number[] = [];
    while (allFlashedStep == 0) {
      currentStep++;
      // Raise all
      var duplicatedArray = octopuses.map(function (arr) {
        return arr.slice();
      });
      duplicatedArray.forEach((row, y) => {
        row.forEach((val, x) => {
          octopuses[y][x]++;
        });
      });
      // Raise neighbours
      var flashed: string[] = [];
      while (
        octopuses.some((row, y) =>
          row.some(
            (num, x) =>
              num > 9 && !flashed.includes(x.toString() + '_' + y.toString())
          )
        )
      ) {
        duplicatedArray = octopuses.map(function (arr) {
          return arr.slice();
        });
        duplicatedArray.forEach((row, y) => {
          row.forEach((val, x) => {
            if (
              val > 9 &&
              !flashed.includes(x.toString() + '_' + y.toString())
            ) {
              flashed.push(x.toString() + '_' + y.toString());
              directions.forEach((d) => {
                var nX = x + d[0];
                var nY = y + d[1];
                if (nX >= 0 && nX < maxX && nY >= 0 && nY < maxY) {
                  octopuses[nY][nX]++;
                }
              });
            }
          });
        });
      }
      if (flashed.length == maxX * maxY) {
        allFlashedStep = currentStep;
      }
      flashes.push(flashed.length);
      // Resets
      duplicatedArray = octopuses.map(function (arr) {
        return arr.slice();
      });
      duplicatedArray.forEach((row, y) => {
        row.forEach((val, x) => {
          if (val > 9) {
            octopuses[y][x] = 0;
          }
        });
      });
      snapshots.push(
        octopuses.map(function (arr) {
          return arr.slice();
        })
      );
    }
    return {
      result: allFlashedStep,
      component: OctopusFlashesVisualizerComponent,
      componentData: {
        snapshots: snapshots,
        flashes: flashes,
      },
    };
  }
}
