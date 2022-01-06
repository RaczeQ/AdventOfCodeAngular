import { Injectable } from '@angular/core';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { Point2D } from '../helper/util-functions/point';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';
import { SeaCucumbersVisualizerComponent } from './components/sea-cucumbers-visualizer/sea-cucumbers-visualizer.component';

@Injectable({
  providedIn: 'root',
})
export class Day25Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2021, 25, 'Sea Cucumber');
  }

  private parseArea(input: string): string[][] {
    return splitIntoLines(input).map((l) => l.split(''));
  }

  private moveCucumbers(area: string[][]): string[][][] {
    var result: string[][][] = [JSON.parse(JSON.stringify(area))];
    var moved = true;
    var height = area.length;
    var width = area[0].length;
    while (moved) {
      moved = false;
      var horizontalCucumbersToMove: Point2D[] = [];
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (area[y][x] == '>' && area[y][(x + 1) % width] == '.') {
            horizontalCucumbersToMove.push({ x, y });
            moved = true;
          }
        }
      }
      horizontalCucumbersToMove.forEach(({ x, y }) => {
        area[y][x] = '.';
        area[y][(x + 1) % width] = '>';
      });

      var verticalCucumbersToMove: Point2D[] = [];
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (area[y][x] == 'v' && area[(y + 1) % height][x] == '.') {
            verticalCucumbersToMove.push({ x, y });
            moved = true;
          }
        }
      }
      verticalCucumbersToMove.forEach(({ x, y }) => {
        area[y][x] = '.';
        area[(y + 1) % height][x] = 'v';
      });
      result.push(JSON.parse(JSON.stringify(area)));
    }
    return result;
  }

  override solvePart1(input: string): PuzzleResult {
    var startArea = this.parseArea(input);
    var result = this.moveCucumbers(startArea);
    return {
      result: result.length - 1,
      component: SeaCucumbersVisualizerComponent,
      componentData: {
        areas: result,
      },
    };
  }
  override solvePart2(input: string): number {
    return 0;
  }
}
