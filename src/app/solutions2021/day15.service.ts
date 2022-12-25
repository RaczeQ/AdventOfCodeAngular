import { Injectable } from '@angular/core';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { aStar, generatePositions } from '../helper/util-functions/astar';
import { parseInto2DNumbersArray } from '../helper/util-functions/parse-into-2d-numbers-array';

@Injectable({
  providedIn: 'root',
})
export class Day15Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(
      solutionsCollectorService,
      2021,
      15,
      'Chiton',
      'Note that the algorithm works long for matrices of larger size (100x100). The page may hang for 3+ minutes during the calculation of part 2 (depending on the processor power).'
    );
  }

  override solvePart1(input: string): PuzzleResult {
    var positions = generatePositions(parseInto2DNumbersArray(input));
    var height = positions[positions.length - 1].y + 1;
    var width = positions[positions.length - 1].x + 1;
    var { dist, parents } = aStar(positions, 0, positions.length - 1);
    var path = [positions.length - 1];
    while (path[path.length - 1] !== undefined && path[path.length - 1] != 0) {
      path.push(parents[path[path.length - 1]]!);
    }
    var xValues: number[] = [];
    var yValues: number[] = [];
    var zValues: number[] = [];
    dist
      .map((p, idx) => {
        return { p, idx };
      })
      .filter((t) => t.p < Number.MAX_VALUE)
      .forEach((t) => {
        xValues.push(t.idx % width);
        yValues.push(Math.floor(t.idx / width));
        zValues.push(t.p);
      });
    return {
      result: dist[dist.length - 1],
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            x: xValues,
            y: yValues,
            z: zValues,
            colorscale: 'Portland',
            type: 'heatmap',
            colorbar: {
              title: 'Distance from origin',
              titlefont: {
                color: '#ffffff',
              },
              tickfont: {
                color: '#ffffff',
              },
            },
          },
          {
            x: path.map((p) => p % width),
            y: path.map((p) => Math.floor(p / width)),
            mode: 'markers',
            marker: {
              size: path.map((p) => 5),
              color: '#ffffff',
            },
          },
        ],
        graphLayout: {
          yaxis: {
            title: 'Y',
            range: [height - 1 + 0.5, 0 - 0.5],
            scaleanchor: 'x',
          },
          xaxis: {
            title: 'X',
            range: [0 - 0.5, width - 1 + 0.5],
          },
        },
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var positions = generatePositions(parseInto2DNumbersArray(input), 5);
    var height = positions[positions.length - 1].y + 1;
    var width = positions[positions.length - 1].x + 1;
    var { dist, parents } = aStar(positions, 0, positions.length - 1);
    var path = [positions.length - 1];
    while (path[path.length - 1] !== undefined && path[path.length - 1] != 0) {
      path.push(parents[path[path.length - 1]]!);
    }
    var xValues: number[] = [];
    var yValues: number[] = [];
    var zValues: number[] = [];
    dist
      .map((p, idx) => {
        return { p, idx };
      })
      .filter((t) => t.p < Number.MAX_VALUE)
      .forEach((t) => {
        xValues.push(t.idx % width);
        yValues.push(Math.floor(t.idx / width));
        zValues.push(t.p);
      });
    return {
      result: dist[dist.length - 1],
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            x: xValues,
            y: yValues,
            z: zValues,
            colorscale: 'Portland',
            type: 'heatmap',
            colorbar: {
              title: 'Distance from origin',
              titlefont: {
                color: '#ffffff',
              },
              tickfont: {
                color: '#ffffff',
              },
            },
          },
          {
            x: path.map((p) => p % width),
            y: path.map((p) => Math.floor(p / width)),
            mode: 'markers',
            marker: {
              size: path.map((p) => 5),
              color: '#ffffff',
            },
          },
        ],
        graphLayout: {
          yaxis: {
            title: 'Y',
            range: [height - 1 + 0.5, 0 - 0.5],
            scaleanchor: 'x',
          },
          xaxis: {
            title: 'X',
            range: [0 - 0.5, width - 1 + 0.5],
          },
        },
      },
    };
  }
}
