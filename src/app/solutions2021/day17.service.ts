import { Injectable } from '@angular/core';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
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
export class Day17Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(
      solutionsCollectorService,
      2021,
      17,
      'Trick Shot',
      'Graph for part 2 on real input can take a while to render.'
    );
  }

  private getTargetArea(input: string): {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
  } {
    var lines = splitIntoLines(input);
    var parts = lines[0].split('=');
    var xPart = parts[1].split(',')[0].split('..').map(Number);
    var yPart = parts[2].split('..').map(Number);
    return {
      x0: xPart[0],
      x1: xPart[1],
      y0: yPart[0],
      y1: yPart[1],
    };
  }

  private calculateMaxDistance(vel: number): number {
    var distance = 0;
    while (Math.abs(vel) > 0) {
      distance += vel;
      vel += vel > 0 ? -1 : 1;
    }
    return distance;
  }

  private isXValid(vel: number, x0: number, x1: number): boolean {
    var x = 0;
    while (Math.abs(vel) > 0) {
      x += vel;
      vel += vel > 0 ? -1 : 1;
      if (
        Math.abs(x) >= Math.min(Math.abs(x0), Math.abs(x1)) &&
        Math.abs(x) <= Math.max(Math.abs(x0), Math.abs(x1))
      ) {
        return true;
      }
    }
    return false;
  }

  private isYValid(vel: number, maxY: number, minY: number): boolean {
    var y = 0;
    while (true) {
      y += vel;
      vel--;
      if (y <= maxY && y >= minY) {
        return true;
      } else if (y < minY) {
        return false;
      }
    }
  }

  private isTrajectoryValid(
    xVel: number,
    yVel: number,
    x0: number,
    x1: number,
    maxY: number,
    minY: number
  ): boolean {
    var x = 0;
    var y = 0;
    while (
      !(
        Math.abs(x) >= Math.min(Math.abs(x0), Math.abs(x1)) &&
        Math.abs(x) <= Math.max(Math.abs(x0), Math.abs(x1)) &&
        y >= minY &&
        y <= maxY
      )
    ) {
      if (xVel == 0 && y < minY) {
        return false;
      }
      x += xVel;
      if (xVel != 0) {
        xVel += xVel > 0 ? -1 : 1;
      }
      y += yVel;
      yVel--;
    }
    return true;
  }

  private generateVelocities(
    x0: number,
    x1: number,
    y0: number,
    y1: number
  ): { x: number; y: number }[] {
    var availableXVelocities: number[] = [];
    var availableYVelocities: number[] = [];
    var maxY = Math.max(y0, y1);
    var minY = Math.min(y0, y1);
    var xDirections = [];
    if (x0 < 0 || x1 < 0) {
      xDirections.push(-1);
    }
    if (x0 > 0 || x1 > 0) {
      xDirections.push(1);
    }
    xDirections.forEach((dir) => {
      var vel = 0;
      while (Math.abs(vel) <= Math.max(Math.abs(x0), Math.abs(x1))) {
        vel += dir;
        if (this.isXValid(vel, x0, x1)) {
          availableXVelocities.push(vel);
        }
      }
    });
    var yVel = Math.abs(minY);
    while (yVel >= minY) {
      if (this.isYValid(yVel, maxY, minY)) {
        availableYVelocities.push(yVel);
      }
      yVel--;
    }
    return availableXVelocities
      .flatMap((x) =>
        availableYVelocities.map((y) => {
          return { x, y };
        })
      )
      .filter((t) => this.isTrajectoryValid(t.x, t.y, x0, x1, maxY, minY));
  }

  private generatePath(
    xVel: number,
    yVel: number,
    x0: number,
    x1: number,
    y0: number,
    y1: number
  ): { x: number; y: number }[] {
    var result: { x: number; y: number }[] = [{ x: 0, y: 0 }];
    var x = 0;
    var y = 0;
    while (
      !(
        Math.abs(x) >= Math.min(Math.abs(x0), Math.abs(x1)) &&
        Math.abs(x) <= Math.max(Math.abs(x0), Math.abs(x1)) &&
        y >= Math.min(y0, y1) &&
        y <= Math.max(y0, y1)
      )
    ) {
      x += xVel;
      if (xVel != 0) {
        xVel += xVel > 0 ? -1 : 1;
      }
      y += yVel;
      yVel--;
      result.push({ x, y });
    }
    return result;
  }

  override solvePart1(input: string): PuzzleResult {
    var { x0, x1, y0, y1 } = this.getTargetArea(input);
    var velocities = this.generateVelocities(x0, x1, y0, y1);
    var maxY = Math.max(...velocities.map((t) => t.y));
    var paths = velocities
      .filter((v) => v.y == maxY)
      .map((v) => this.generatePath(v.x, v.y, x0, x1, y0, y1));
    return {
      result: this.calculateMaxDistance(maxY),
      component: PlotlyGraphComponent,
      componentData: {
        graphData: paths
          .map((p) => {
            return {
              x: p.map((c) => c.x),
              y: p.map((c) => c.y),
              mode: 'lines',
              opacity: 0.5,
              type: 'scattergl',
              showlegend: false,
              legendgroup: 'pathL',
            } as any;
          })
          .concat(
            paths.map((p) => {
              return {
                x: p.map((c) => c.x),
                y: p.map((c) => c.y),
                mode: 'markers',
                type: 'scattergl',
                showlegend: false,
                legendgroup: 'pathL',
              } as any;
            })
          ),
        graphLayout: {
          shapes: [
            {
              type: 'rect',
              xref: 'x',
              yref: 'y',
              x0: x0,
              y0: y0,
              x1: x1,
              y1: y1,
              fillcolor: '#000000',
              opacity: 0.25,
              line: {
                width: 0,
              },
            },
            {
              type: 'rect',
              xref: 'x',
              yref: 'y',
              x0: x0,
              y0: y0,
              x1: x1,
              y1: y1,
              opacity: 1,
              line: {
                width: 2,
                color: '#fad02c',
              },
            },
          ],
          yaxis: {
            title: 'Y',
          },
          xaxis: {
            title: 'X',
          },
        },
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var { x0, x1, y0, y1 } = this.getTargetArea(input);
    var velocities = this.generateVelocities(x0, x1, y0, y1);
    var paths = velocities.map((v) =>
      this.generatePath(v.x, v.y, x0, x1, y0, y1)
    );
    return {
      result: velocities.length,
      component: PlotlyGraphComponent,
      componentData: {
        graphData: paths
          .map((p) => {
            return {
              x: p.map((c) => c.x),
              y: p.map((c) => c.y),
              mode: 'lines',
              opacity: 0.5,
              type: 'scattergl',
              showlegend: false,
              legendgroup: 'pathL',
            } as any;
          })
          .concat(
            paths.map((p) => {
              return {
                x: p.map((c) => c.x),
                y: p.map((c) => c.y),
                mode: 'markers',
                type: 'scattergl',
                showlegend: false,
                legendgroup: 'pathL',
              } as any;
            })
          ),
        graphLayout: {
          shapes: [
            {
              type: 'rect',
              xref: 'x',
              yref: 'y',
              x0: x0,
              y0: y0,
              x1: x1,
              y1: y1,
              fillcolor: '#000000',
              opacity: 0.25,
              line: {
                width: 0,
              },
            },
            {
              type: 'rect',
              xref: 'x',
              yref: 'y',
              x0: x0,
              y0: y0,
              x1: x1,
              y1: y1,
              opacity: 1,
              line: {
                width: 2,
                color: '#fad02c',
              },
            },
          ],
          yaxis: {
            title: 'Y',
          },
          xaxis: {
            title: 'X',
          },
        },
      },
    };
  }
}
