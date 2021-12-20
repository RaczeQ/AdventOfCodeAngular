import { Injectable } from '@angular/core';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';
import { SnailfishNumberVisualizerComponent } from './components/snailfish-number-visualizer/snailfish-number-visualizer.component';

export interface SnailfishNumber {
  x: number | SnailfishNumber;
  y: number | SnailfishNumber;
  xPosition?: number;
  yPosition?: number;
  parent?: SnailfishNumber;
}

@Injectable({
  providedIn: 'root',
})
export class Day18Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2021, 18, 'Snailfish');
  }

  private parseSnailfishNumber(
    line: string,
    idx: number = 0
  ): [SnailfishNumber, number] {
    var result: SnailfishNumber = {
      x: 0,
      y: 0,
    };
    idx++;
    if (line[idx] != '[') {
      var startIdx = idx;
      while (line[idx] != ',') {
        idx++;
      }
      result.x = Number.parseInt(line.slice(startIdx, idx));
    } else {
      [result.x, idx] = this.parseSnailfishNumber(line, idx);
      result.x.parent = result;
    }
    idx++;
    if (line[idx] != '[') {
      var startIdx = idx;
      while (line[idx] != ']') {
        idx++;
      }
      result.y = Number.parseInt(line.slice(startIdx, idx));
    } else {
      [result.y, idx] = this.parseSnailfishNumber(line, idx);
      result.y.parent = result;
    }
    idx++;
    var i = 0;
    [result, i] = this.applyPositions(result);
    return [result, idx];
  }

  private applyPositions(
    n: SnailfishNumber,
    pos: number = 0
  ): [SnailfishNumber, number] {
    n.xPosition = undefined;
    n.yPosition = undefined;
    if (typeof n.x === 'number') {
      n.xPosition = pos++;
    } else {
      [n.x, pos] = this.applyPositions(n.x, pos);
    }
    if (typeof n.y === 'number') {
      n.yPosition = pos++;
    } else {
      [n.y, pos] = this.applyPositions(n.y, pos);
    }
    return [n, pos];
  }

  private findDeepNumber(
    n: SnailfishNumber,
    depth: number = 0
  ): SnailfishNumber | undefined {
    if (depth >= 4) {
      return n;
    }
    var result = undefined;
    if (typeof n.x != 'number') {
      result = this.findDeepNumber(n.x as SnailfishNumber, depth + 1);
    }
    if (!result && typeof n.y != 'number') {
      result = this.findDeepNumber(n.y as SnailfishNumber, depth + 1);
    }
    return result;
  }

  private findBigNumber(n: SnailfishNumber): SnailfishNumber | undefined {
    var result = undefined;
    if (typeof n.x != 'number') {
      result = this.findBigNumber(n.x as SnailfishNumber);
    } else if (n.x > 9) {
      return n;
    }
    if (!result) {
      if (typeof n.y != 'number') {
        result = this.findBigNumber(n.y as SnailfishNumber);
      } else if (n.y > 9) {
        return n;
      }
    }
    return result;
  }

  private findClosestNumber(
    n: SnailfishNumber,
    position: number
  ): SnailfishNumber | undefined {
    if (
      (n.xPosition != undefined && n.xPosition == position) ||
      (n.yPosition != undefined && n.yPosition == position)
    ) {
      return n;
    }
    var result = undefined;
    if (typeof n.x != 'number') {
      result = this.findClosestNumber(n.x as SnailfishNumber, position);
    }
    if (!result && typeof n.y != 'number') {
      result = this.findClosestNumber(n.y as SnailfishNumber, position);
    }
    return result;
  }

  private reduceSnailfishNumber(
    n: SnailfishNumber
  ): [SnailfishNumber, SnailfishNumber | undefined][] {
    var actionDone = true;
    var result: [SnailfishNumber, SnailfishNumber | undefined][] = [
      [this.copyNumber(n), undefined],
    ];
    while (actionDone) {
      var i = 0;
      [n, i] = this.applyPositions(n);
      actionDone = false;
      var deepPair = this.findDeepNumber(n);
      if (deepPair) {
        result.slice(-1)[0][1] = this.copyNumber(deepPair);
        result.slice(-1)[0][1]!.xPosition = deepPair.xPosition;
        result.slice(-1)[0][1]!.yPosition = deepPair.yPosition;
        var closestLeft = this.findClosestNumber(n, deepPair.xPosition! - 1);
        var closestRight = this.findClosestNumber(n, deepPair.yPosition! + 1);
        if (closestLeft) {
          if (
            closestLeft.xPosition != undefined &&
            closestLeft.xPosition == deepPair.xPosition! - 1
          ) {
            (closestLeft.x as number) += deepPair.x as number;
          } else if (
            closestLeft.yPosition != undefined &&
            closestLeft.yPosition == deepPair.xPosition! - 1
          ) {
            (closestLeft.y as number) += deepPair.x as number;
          }
        }
        if (closestRight) {
          if (
            closestRight.xPosition != undefined &&
            closestRight.xPosition == deepPair.yPosition! + 1
          ) {
            (closestRight.x as number) += deepPair.y as number;
          } else if (
            closestRight.yPosition != undefined &&
            closestRight.yPosition == deepPair.yPosition! + 1
          ) {
            (closestRight.y as number) += deepPair.y as number;
          }
        }
        if (deepPair.parent!.x === deepPair) {
          deepPair.parent!.x = 0;
        } else {
          deepPair.parent!.y = 0;
        }
        actionDone = true;
      } else {
        var bigNumber = this.findBigNumber(n);
        if (bigNumber) {
          result.slice(-1)[0][1] = this.copyNumber(bigNumber);
          result.slice(-1)[0][1]!.xPosition = bigNumber.xPosition;
          result.slice(-1)[0][1]!.yPosition = bigNumber.yPosition;
          if (bigNumber.x > 9) {
            bigNumber.x = {
              x: Math.floor((bigNumber.x as number) / 2),
              y: Math.ceil((bigNumber.x as number) / 2),
            };
            bigNumber.x.parent = bigNumber;
          } else if (bigNumber.y > 9) {
            bigNumber.y = {
              x: Math.floor((bigNumber.y as number) / 2),
              y: Math.ceil((bigNumber.y as number) / 2),
            };
            bigNumber.y.parent = bigNumber;
          }
          actionDone = true;
        }
      }
      if (actionDone) {
        result.push([this.copyNumber(n), undefined]);
      }
    }
    return result;
  }

  private addNumbers(
    a: SnailfishNumber,
    b: SnailfishNumber
  ): [SnailfishNumber, SnailfishNumber | undefined][] {
    var newNumber = {
      x: a,
      y: b,
    };
    newNumber.x.parent = newNumber;
    newNumber.y.parent = newNumber;
    var result = this.reduceSnailfishNumber(newNumber);
    return result;
  }

  private copyNumber(n: SnailfishNumber): SnailfishNumber {
    return this.parseSnailfishNumber(this.printNumber(n))[0];
  }

  private printNumber(n: SnailfishNumber): string {
    if (n === undefined) {
      return 'undefined';
    }
    return `[${typeof n.x == 'number' ? n.x : this.printNumber(n.x)},${
      typeof n.y == 'number' ? n.y : this.printNumber(n.y)
    }]`;
  }

  private printPositions(n: SnailfishNumber): string {
    return `[${
      typeof n.x == 'number' ? n.xPosition : this.printPositions(n.x)
    },${typeof n.y == 'number' ? n.yPosition : this.printPositions(n.y)}]`;
  }

  private calculateMagnitude(n: SnailfishNumber): number {
    return (
      3 * (typeof n.x == 'number' ? n.x : this.calculateMagnitude(n.x)) +
      2 * (typeof n.y == 'number' ? n.y : this.calculateMagnitude(n.y))
    );
  }

  override solvePart1(input: string): PuzzleResult {
    var lines = splitIntoLines(input);
    var numbers = lines.map(
      (l) =>
        this.reduceSnailfishNumber(this.parseSnailfishNumber(l)[0]).slice(-1)[0]
    );
    var currentNumber = numbers[0];
    var snapshots: [SnailfishNumber, SnailfishNumber | undefined][][] = [];
    for (let index = 1; index < numbers.length; index++) {
      const number = numbers[index];
      var tempSnapshots = this.addNumbers(currentNumber[0], number[0]);
      snapshots.push(tempSnapshots);
      currentNumber = tempSnapshots.slice(-1)[0];
    }
    return {
      result: this.calculateMagnitude(snapshots.slice(-1)[0].slice(-1)[0][0]),
      component: SnailfishNumberVisualizerComponent,
      componentData: {
        snapshots: snapshots,
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var lines = splitIntoLines(input);
    var magnitudes = lines
      .flatMap((l1, idx1) => {
        return lines.map((l2, idx2) => {
          return { idx1, idx2 };
        });
      })
      .filter(({ idx1, idx2 }) => idx1 != idx2)
      .map(({ idx1, idx2 }) => {
        return {
          idx1: idx1,
          idx2: idx2,
          mag: this.calculateMagnitude(
            this.addNumbers(
              this.reduceSnailfishNumber(
                this.parseSnailfishNumber(lines[idx1])[0]
              ).slice(-1)[0][0],
              this.reduceSnailfishNumber(
                this.parseSnailfishNumber(lines[idx2])[0]
              ).slice(-1)[0][0]
            ).slice(-1)[0][0]
          ),
        };
      });
    var maxMagnitudeIdx = magnitudes.findIndex(
      (m) => m.mag == Math.max(...magnitudes.map((m) => m.mag))
    );
    return {
      result: magnitudes[maxMagnitudeIdx].mag,
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            x: magnitudes.map((m) => m.idx2),
            y: magnitudes.map((m) => m.idx1),
            z: magnitudes.map((m) => m.mag),
            colorscale: 'Portland',
            type: 'heatmap',
            colorbar: {
              title: 'Magnitude',
              titlefont: {
                color: '#ffffff',
              },
              tickfont: {
                color: '#ffffff',
              },
            },
          },
          {
            x: [magnitudes[maxMagnitudeIdx].idx2],
            y: [magnitudes[maxMagnitudeIdx].idx1],
            mode: 'markers',
            marker: {
              size: 10,
              color: '#ffffff',
              line: {
                color: '#000000',
                width: 2,
              },
            },
          },
        ],
        graphLayout: {
          yaxis: {
            title: 'First number index',
            autorange: 'reversed',
          },
          xaxis: {
            title: 'Second number index',
            side: 'top',
          },
        },
      },
    };
  }
}
