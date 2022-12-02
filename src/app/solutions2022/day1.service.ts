import { Injectable } from '@angular/core';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { parseIntoNumbers } from '../helper/util-functions/parse-into-numbers';
import { sumNumbers } from '../helper/util-functions/sum';

@Injectable({
  providedIn: 'root',
})
export class Day1Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2022, 1, 'Calorie Counting');
  }
  override solvePart1(input: string): PuzzleResult {
    var groups = input.split('\n\n').map(parseIntoNumbers);
    var intakes = groups.map(sumNumbers);
    var result = Math.max(...intakes);
    return {
      result: result,
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            x: intakes.map((val, idx) => idx + 1),
            y: intakes,
            type: 'bar',
            marker: { color: '#fad02c' },
          },
        ],
        graphLayout: {
          yaxis: { title: 'Calories sum' },
          xaxis: { title: 'Elf', automargin: true },
        },
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var groups = input.split('\n\n').map(parseIntoNumbers);
    var intakes = groups
      .map(sumNumbers)
      .map((val, idx) => [val, idx + 1])
      .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));

    var triple_intakes = intakes.slice(0, -2).map((val, idx) => {
      var sub_arr = intakes.slice(idx, idx + 3);
      return [
        sub_arr.reduce((acc, cur) => {
          return acc + cur[0];
        }, 0),
        sub_arr.map((x) => x[1]).join(' + '),
      ];
    });

    return {
      result: triple_intakes.slice(-1)[0][0],
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            x: triple_intakes.map((val) => val[1]),
            y: triple_intakes.map((val) => val[0]),
            type: 'bar',
            marker: { color: '#fad02c' },
          },
        ],
        graphLayout: {
          yaxis: { title: 'Calories sum' },
          xaxis: { title: 'Elf', type: 'category', automargin: true },
        },
      },
    };
  }
}
