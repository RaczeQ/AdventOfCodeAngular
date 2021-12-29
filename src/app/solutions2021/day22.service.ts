import { Injectable } from '@angular/core';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { Point3D, points3DEqual } from '../helper/util-functions/point';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';

// inspired by this comment: https://www.reddit.com/r/adventofcode/comments/rlxhmg/comment/hq7ho3r/?utm_source=reddit&utm_medium=web2x&context=3
function clamp(n: number, nmin: number, nmax: number): number {
  return Math.max(Math.min(n, nmax), nmin);
}

function split(
  start: Point3D,
  end: Point3D,
  point: Point3D
): [Point3D, Point3D][] {
  var { x: sx, y: sy, z: sz } = start;
  var { x: ex, y: ey, z: ez } = end;
  var { x: px, y: py, z: pz } = point;
  return [
    [
      { x: sx, y: sy, z: sz },
      { x: px, y: py, z: pz },
    ],
    [
      { x: px, y: sy, z: sz },
      { x: ex, y: py, z: pz },
    ],
    [
      { x: sx, y: py, z: sz },
      { x: px, y: ey, z: pz },
    ],
    [
      { x: px, y: py, z: sz },
      { x: ex, y: ey, z: pz },
    ],
    [
      { x: sx, y: sy, z: pz },
      { x: px, y: py, z: ez },
    ],
    [
      { x: px, y: sy, z: pz },
      { x: ex, y: py, z: ez },
    ],
    [
      { x: sx, y: py, z: pz },
      { x: px, y: ey, z: ez },
    ],
    [
      { x: px, y: py, z: pz },
      { x: ex, y: ey, z: ez },
    ],
  ];
}

export class Cuboid {
  constructor(
    public mode: boolean,
    public start: Point3D,
    public end: Point3D,
    public children: Cuboid[] = []
  ) {}

  get size(): number {
    var result =
      (this.end.x - this.start.x) *
      (this.end.y - this.start.y) *
      (this.end.z - this.start.z);
    return result;
  }

  split(point: Point3D) {
    split(this.start, this.end, point).forEach(
      ([newStart, newEnd]: [Point3D, Point3D]) => {
        var child = new Cuboid(this.mode, newStart, newEnd);
        if (child.size > 0) {
          this.children.push(child);
        }
      }
    );
  }

  clamp(to: Cuboid): Cuboid {
    var newStart: Point3D = {
      x: clamp(this.start.x, to.start.x, to.end.x),
      y: clamp(this.start.y, to.start.y, to.end.y),
      z: clamp(this.start.z, to.start.z, to.end.z),
    };
    var newEnd: Point3D = {
      x: clamp(this.end.x, to.start.x, to.end.x),
      y: clamp(this.end.y, to.start.y, to.end.y),
      z: clamp(this.end.z, to.start.z, to.end.z),
    };
    return new Cuboid(this.mode, newStart, newEnd);
  }

  toggle(subset: Cuboid) {
    if (subset.size > 0) {
      if (this.children.length > 0) {
        this.children.forEach((child) => child.toggle(subset.clamp(child)));
      } else if (subset.mode != this.mode) {
        if (points3DEqual(subset.start, this.start)) {
          if (points3DEqual(subset.end, this.end)) {
            this.mode = subset.mode;
          } else {
            this.split(subset.end);
            this.children[0].mode = subset.mode;
          }
        } else {
          this.split(subset.start);
          this.children.slice(-1)[0].toggle(subset);
        }
      }
    }
  }

  countToggled(): number {
    if (this.children.length > 0) {
      return this.children.map((c) => c.countToggled()).reduce((a, b) => a + b);
    }
    return this.mode ? this.size : 0;
  }

  getFinalChildren(): Cuboid[] {
    return this.children.length > 0
      ? this.children.map((c) => c.getFinalChildren()).flat()
      : [this];
  }

  getAllPoints(): Point3D[] {
    return [
      { x: this.start.x, y: this.start.y, z: this.start.z },
      { x: this.start.x, y: this.end.y, z: this.start.z },
      { x: this.end.x, y: this.end.y, z: this.start.z },
      { x: this.end.x, y: this.start.y, z: this.start.z },
      { x: this.start.x, y: this.start.y, z: this.end.z },
      { x: this.start.x, y: this.end.y, z: this.end.z },
      { x: this.end.x, y: this.end.y, z: this.end.z },
      { x: this.end.x, y: this.start.y, z: this.end.z },
    ];
  }
}

@Injectable({
  providedIn: 'root',
})
export class Day22Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2021, 22, 'Reactor Reboot');
  }

  private getRebootSteps(input: string): Cuboid[] {
    var result: Cuboid[] = [];
    var lines = splitIntoLines(input);
    lines.forEach((line) => {
      var parts = line.split(' ');
      var mode = parts[0];
      var coordinates = parts[1].split(',');
      var [minX, maxX] = coordinates[0].slice(2).split('..').map(Number);
      var [minY, maxY] = coordinates[1].slice(2).split('..').map(Number);
      var [minZ, maxZ] = coordinates[2].slice(2).split('..').map(Number);
      result.push(
        new Cuboid(
          mode == 'on',
          {
            x: minX,
            y: minY,
            z: minZ,
          },
          {
            x: maxX + 1,
            y: maxY + 1,
            z: maxZ + 1,
          }
        )
      );
    });
    return result;
  }

  override solvePart1(input: string): PuzzleResult {
    var steps = this.getRebootSteps(input);
    var reactor = new Cuboid(
      false,
      { x: -50, y: -50, z: -50 },
      { x: 52, y: 52, z: 52 }
    );
    steps.forEach((step) => {
      reactor.toggle(step);
    });
    return {
      result: reactor.countToggled(),
      component: PlotlyGraphComponent,
      componentData: {
        graphData: reactor
          .getFinalChildren()
          .filter((c) => c.mode)
          .map((c) => {
            return {
              type: 'mesh3d',
              x: c.getAllPoints().map((p) => p.x),
              y: c.getAllPoints().map((p) => p.y),
              z: c.getAllPoints().map((p) => p.z),
              i: [7, 0, 0, 0, 4, 4, 6, 6, 4, 0, 3, 2],
              j: [3, 4, 1, 2, 5, 6, 5, 2, 0, 1, 6, 3],
              k: [0, 7, 2, 3, 6, 7, 1, 1, 5, 5, 7, 6],
              color: 'rgba(250, 208, 44, 0.2)',
            };
          }),
        graphLayout: {
          yaxis: { title: 'Y' },
          xaxis: { title: 'X' },
          zaxis: { title: 'Z' },
        },
        graphConfig: {
          displayModeBar: false,
          staticPlot: false,
        },
      },
    };
  }

  override solvePart2(input: string): PuzzleResult {
    var steps = this.getRebootSteps(input);
    var minX = Math.min(...steps.map((s) => s.start.x));
    var maxX = Math.max(...steps.map((s) => s.end.x));
    var minY = Math.min(...steps.map((s) => s.start.y));
    var maxY = Math.max(...steps.map((s) => s.end.y));
    var minZ = Math.min(...steps.map((s) => s.start.z));
    var maxZ = Math.max(...steps.map((s) => s.end.z));
    var reactor = new Cuboid(
      false,
      { x: minX, y: minY, z: minZ },
      { x: maxX + 1, y: maxY + 1, z: maxZ + 1 }
    );
    var counts: number[] = [0];
    steps.forEach((step) => {
      reactor.toggle(step);
      counts.push(reactor.countToggled());
    });

    return {
      result: counts.slice(-1)[0],
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            x: counts.map((c, i) => i),
            y: counts.map((c, i) => c),
            mode: 'lines',
          },
        ],
        graphLayout: {
          yaxis: {
            title: 'Cubes turned on',
          },
          xaxis: {
            title: 'Step',
          },
        },
      },
    };
  }
}
