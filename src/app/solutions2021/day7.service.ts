import { Injectable } from '@angular/core';
import { PlotlyGraphComponentComponent } from '../helper/components/plotly-graph-component/plotly-graph-component.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { parseFirstLineIntoNumbers } from '../helper/util-functions/parse-first-line-into-numbers';

function sumNumber(num: number) {
  var rval = 1;
  for (var i = 2; i <= num; i++) rval = rval + i;
  return rval;
}

@Injectable({
  providedIn: 'root',
})
export class Day7Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2021, 7, 'The Treachery of Whales');
  }
  override solvePart1(input: string): PuzzleResult {
    var positions = parseFirstLineIntoNumbers(input);
    var bestPos = -1;
    var bestCost = -1;
    for (let i = Math.min(...positions); i <= Math.max(...positions); i++) {
      var cost = positions
        .map((pos) => Math.abs(pos - i))
        .reduce((a, b) => a + b);
      if (bestPos < 0 || cost < bestCost) {
        bestPos = i;
        bestCost = cost;
      }
    }
    return {
      result: bestCost,
      component: PlotlyGraphComponentComponent,
      componentData: {
        graphData: positions.map((pos, idx) => {
          return {
            x: [pos, bestPos],
            y: [idx, idx],
            mode: 'markers',
            type: 'scattergl',
            showlegend: false,
            legendgroup: 'crab',
          };
        }),
        graphLayout: {
          yaxis: { title: 'Crabs', visible: false },
          xaxis: { title: 'Positions' },
        },
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var positions = parseFirstLineIntoNumbers(input);
    var bestPos = -1;
    var bestCost = -1;
    for (let i = Math.min(...positions); i <= Math.max(...positions); i++) {
      var cost = positions
        .map((pos) => sumNumber(Math.abs(pos - i)))
        .reduce((a, b) => a + b);
      if (bestPos < 0 || cost < bestCost) {
        bestPos = i;
        bestCost = cost;
      }
    }
    return {
      result: bestCost,
      component: PlotlyGraphComponentComponent,
      componentData: {
        graphData: positions.map((pos, idx) => {
          return {
            x: [pos, bestPos],
            y: [idx, idx],
            mode: 'markers',
            type: 'scattergl',
            showlegend: false,
            legendgroup: 'crab',
          };
        }),
        graphLayout: {
          yaxis: { title: 'Crabs', visible: false },
          xaxis: { title: 'Positions' },
        },
      },
    };
  }
}
