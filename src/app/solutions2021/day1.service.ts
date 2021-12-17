import { Injectable } from '@angular/core';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { parseIntoNumbers } from '../helper/util-functions/parse-into-numbers';

@Injectable({
  providedIn: 'root',
})
export class Day1Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2021, 1, 'Sonar Sweep');
  }
  override solvePart1(input: string): PuzzleResult {
    var measurements = parseIntoNumbers(input);
    var increases = [];
    for (let i = 1; i < measurements.length; i++) {
      if (measurements[i - 1] < measurements[i]) {
        increases.push([i, measurements[i]]);
      }
    }
    return {
      result: increases.length,
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            x: measurements.map((val, idx) => idx),
            y: measurements,
            mode: 'lines',
            name: 'Measurements',
            line: {
              color: 'rgba(#ffffff, 0.8)',
            },
          },
          {
            x: increases.map((t) => t[0]),
            y: increases.map((t) => t[1]),
            mode: 'markers',
            name: 'Increases',
            marker: {
              color: '#fad02c',
              size: 2,
            },
          },
        ],
        graphLayout: {
          yaxis: { title: 'Depth', autorange: 'reversed' },
          xaxis: { title: 'Time' },
        },
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var measurements = parseIntoNumbers(input);
    var measurementsWindows = [];
    var increases = [];
    measurementsWindows.push([
      2,
      measurements[0] + measurements[1] + measurements[2],
    ]);
    for (let i = 3; i < measurements.length; i++) {
      const window1 =
        measurements[i - 3] + measurements[i - 2] + measurements[i - 1];
      const window2 =
        measurements[i - 2] + measurements[i - 1] + measurements[i];
      measurementsWindows.push([i, window2]);
      if (window1 < window2) {
        increases.push([i, window2]);
      }
    }
    return {
      result: increases.length,
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            x: measurementsWindows.map((t) => t[0]),
            y: measurementsWindows.map((t) => t[1]),
            mode: 'lines',
            name: 'Measurements',
            line: {
              color: 'rgba(#ffffff, 0.8)',
            },
          },
          {
            x: increases.map((t) => t[0]),
            y: increases.map((t) => t[1]),
            mode: 'markers',
            name: 'Increases',
            marker: {
              color: 'rgb(#fad02c)',
              size: 2,
            },
          },
        ],
        graphLayout: { yaxis: { title: 'Depth', autorange: 'reversed' } },
      },
    };
  }
}
