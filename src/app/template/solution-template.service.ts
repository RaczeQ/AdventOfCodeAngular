import { Injectable } from '@angular/core';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';

@Injectable({
  providedIn: 'root',
})
export class Day0Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2020, 0, 'template');
  }
  override solvePart1(
    input: string
  ):
    | string
    | number
    | PuzzleResult
    | Promise<number>
    | Promise<string>
    | Promise<PuzzleResult> {
    return {
      result: 0,
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [],
        graphLayout: {},
      },
    };
  }
  override solvePart2(
    input: string
  ):
    | string
    | number
    | PuzzleResult
    | Promise<number>
    | Promise<string>
    | Promise<PuzzleResult> {
    return {
      result: 0,
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [],
        graphLayout: {},
      },
    };
  }
}
