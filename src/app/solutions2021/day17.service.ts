import { Injectable } from '@angular/core';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';
import { BitsVisualizerComponent } from './components/bits-visualizer/bits-visualizer.component';

@Injectable({
  providedIn: 'root',
})
export class Day16Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2021, 17, 'Trick Shot');
  }

  override solvePart1(input: string): PuzzleResult {
    var lines = splitIntoLines(input);
    return {
      result: 0,
      component: BitsVisualizerComponent,
      componentData: {
        // packet: packet,
        // showValues: false,
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var lines = splitIntoLines(input);
    return {
      result: 0,
      component: PlotlyGraphComponent,
      componentData: {
        // packet: packet,
        // showValues: true,
      },
    };
  }
}
