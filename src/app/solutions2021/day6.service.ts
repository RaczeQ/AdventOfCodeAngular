import { Injectable } from '@angular/core';
import { PlotlyGraphComponentComponent } from '../helper/components/plotly-graph-component/plotly-graph-component.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';

@Injectable({
  providedIn: 'root',
})
export class Day6Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2021, 6, 'Lanternfish');
  }
  private getInitialState(input: string): { [day: number]: number } {
    var commands = splitIntoLines(input);
    var result: { [day: number]: number } = {};
    commands[0]
      .split(',')
      .map(Number)
      .forEach((n) => {
        if (!(n in result)) {
          result[n] = 0;
        }
        result[n]++;
      });
    return result;
  }
  private solve(input: string, days: number): PuzzleResult {
    var currentState = this.getInitialState(input);
    var y = [
      Object.values(currentState)
        .map(Number)
        .reduce((a, b) => a + b),
    ];
    var x = [0];
    for (let d = 0; d < days; d++) {
      var newState: { [day: number]: number } = {};
      Object.keys(currentState)
        .map(Number)
        .sort()
        .forEach((day) => {
          if (day > 0) {
            if (!(day - 1 in newState)) {
              newState[day - 1] = 0;
            }
            newState[day - 1] += currentState[day];
          } else {
            newState[6] = currentState[day];
            newState[8] = currentState[day];
          }
        });
      currentState = newState;
      y.push(
        Object.values(currentState)
          .map(Number)
          .reduce((a, b) => a + b)
      );
      x.push(d + 1);
    }
    return {
      result: y[y.length - 1],
      component: PlotlyGraphComponentComponent,
      componentData: {
        graphData: [
          {
            x: x,
            y: y,
            mode: 'lines',
            name: 'Measurements',
            line: {
              color: '#fad02c',
            },
          },
        ],
        graphLayout: {
          yaxis: { title: 'Fishes' },
          xaxis: { title: 'Days' },
        },
      },
    };
  }
  override solvePart1(input: string): PuzzleResult {
    return this.solve(input, 80);
  }
  override solvePart2(input: string): PuzzleResult {
    return this.solve(input, 256);
  }
}
