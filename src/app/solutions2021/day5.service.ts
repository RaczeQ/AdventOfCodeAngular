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

export interface Line {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

@Injectable({
  providedIn: 'root',
})
export class Day5Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2021, 5, 'Hydrothermal Venture');
  }

  private parseToCoordinates(input: string): Line[] {
    return splitIntoLines(input).map((l) => {
      var pairs = l.split('->').map((t) => t.trim().split(','));
      return {
        x1: Number(pairs[0][0]),
        y1: Number(pairs[0][1]),
        x2: Number(pairs[1][0]),
        y2: Number(pairs[1][1]),
      };
    });
  }

  private calculatePositions(line: Line): Point2D[] {
    var steps = Math.max(
      Math.abs(line.x1 - line.x2),
      Math.abs(line.y1 - line.y2)
    );
    var xDir = line.x1 == line.x2 ? 0 : line.x1 < line.x2 ? 1 : -1;
    var yDir = line.y1 == line.y2 ? 0 : line.y1 < line.y2 ? 1 : -1;
    var result = [{ x: line.x1, y: line.y1 }];
    for (let i = 0; i < steps; i++) {
      var lastPos = result[i];
      result.push({ x: lastPos.x + xDir, y: lastPos.y + yDir });
    }
    return result;
  }

  override solvePart1(input: string): PuzzleResult {
    var lines = this.parseToCoordinates(input).filter(
      (l) => l.x1 == l.x2 || l.y1 == l.y2
    );
    var minX = Math.min(...lines.map((l) => [l.x1, l.x2]).flat());
    var maxX = Math.max(...lines.map((l) => [l.x1, l.x2]).flat());
    var minY = Math.min(...lines.map((l) => [l.y1, l.y2]).flat());
    var maxY = Math.max(...lines.map((l) => [l.y1, l.y2]).flat());
    var takenPositions: { [pos: string]: number } = {};
    lines.forEach((line) => {
      var positions = this.calculatePositions(line);
      positions.forEach((pos) => {
        var key = `${pos.x},${pos.y}`;
        if (!(key in takenPositions)) {
          takenPositions[key] = 0;
        }
        takenPositions[key]++;
      });
    });
    return {
      result: Object.values(takenPositions)
        .map(Number)
        .filter((n) => n > 1).length,
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            x: Object.keys(takenPositions).map((key: string) => {
              return key.split(',').map(Number)[0];
            }),
            y: Object.keys(takenPositions).map((key: string) => {
              return key.split(',').map(Number)[1];
            }),
            z: Object.values(takenPositions).map(Number),
            colorscale: 'YlOrRd',
            type: 'heatmap',
            colorbar: {
              tickfont: {
                color: '#ffffff',
              },
            },
          },
        ],
        graphLayout: {
          yaxis: { title: 'Y', range: [maxY + 0.5, minY - 0.5] },
          xaxis: { title: 'X', range: [minX - 0.5, maxX + 0.5] },
        },
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var lines = this.parseToCoordinates(input);
    var minX = Math.min(...lines.map((l) => [l.x1, l.x2]).flat());
    var maxX = Math.max(...lines.map((l) => [l.x1, l.x2]).flat());
    var minY = Math.min(...lines.map((l) => [l.y1, l.y2]).flat());
    var maxY = Math.max(...lines.map((l) => [l.y1, l.y2]).flat());
    var takenPositions: { [pos: string]: number } = {};
    lines.forEach((line) => {
      var positions = this.calculatePositions(line);
      positions.forEach((pos) => {
        var key = `${pos.x},${pos.y}`;
        if (!(key in takenPositions)) {
          takenPositions[key] = 0;
        }
        takenPositions[key]++;
      });
    });
    return {
      result: Object.values(takenPositions)
        .map(Number)
        .filter((n) => n > 1).length,
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            x: Object.keys(takenPositions).map((key: string) => {
              return key.split(',').map(Number)[0];
            }),
            y: Object.keys(takenPositions).map((key: string) => {
              return key.split(',').map(Number)[1];
            }),
            z: Object.values(takenPositions).map(Number),
            colorscale: 'YlOrRd',
            type: 'heatmap',
            colorbar: {
              tickfont: {
                color: '#ffffff',
              },
            },
          },
        ],
        graphLayout: {
          yaxis: { title: 'Y', range: [maxY + 0.5, minY - 0.5] },
          xaxis: { title: 'X', range: [minX - 0.5, maxX + 0.5] },
        },
      },
    };
  }
}
