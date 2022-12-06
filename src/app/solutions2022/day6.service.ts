import { Injectable } from '@angular/core';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';
import { DatastreamBufferVisualizerComponent } from './components/datastream-buffer-visualizer/datastream-buffer-visualizer.component';

function findStartOfPacket(message: string, markerLength: number): number {
  return (
    message
      .split('')
      .findIndex(
        (buffer, idx) =>
          new Set(message.slice(idx, idx + markerLength)).size === markerLength
      ) + markerLength
  );
}

@Injectable({
  providedIn: 'root',
})
export class Day6Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2022, 6, 'Tuning Trouble');
  }
  override solvePart1(input: string): PuzzleResult {
    var datastreamBuffer = splitIntoLines(input)[0];
    var result = findStartOfPacket(datastreamBuffer, 4);
    return {
      result: result,
      component: DatastreamBufferVisualizerComponent,
      componentData: {
        index: result,
        message: datastreamBuffer,
        packetLength: 4,
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var datastreamBuffer = splitIntoLines(input)[0];
    var result = findStartOfPacket(datastreamBuffer, 14);
    return {
      result: result,
      component: DatastreamBufferVisualizerComponent,
      componentData: {
        index: result,
        message: datastreamBuffer,
        packetLength: 14,
      },
    };
  }
}
