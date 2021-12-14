import { Injectable } from '@angular/core';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';
import { CavesVisualizerComponent } from './components/caves-visualizer/caves-visualizer.component';

function isUpperCase(str: string): boolean {
  return str === str.toUpperCase();
}

function isAnyTwice(path: string[]): boolean {
  var smallNodes = path.filter((n) => !isUpperCase(n));
  return smallNodes.length > new Set(smallNodes).size;
}

@Injectable({
  providedIn: 'root',
})
export class Day12Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2021, 12, 'Passage Pathing');
  }

  generateGraph(input: string): { [key: string]: string[] } {
    var edges = splitIntoLines(input);
    var nodes: { [key: string]: string[] } = {};
    edges.forEach((edge) => {
      var caves = edge.split('-');
      [
        [0, 1],
        [1, 0],
      ].forEach(([idx0, idx1]) => {
        if (!(caves[idx0] in nodes)) {
          nodes[caves[idx0]] = [];
        }
        if (!nodes[caves[idx0]].includes(caves[idx1])) {
          nodes[caves[idx0]].push(caves[idx1]);
        }
      });
    });
    return nodes;
  }

  generatePaths(
    nodes: { [key: string]: string[] },
    allowSmallTwice = false
  ): string[][] {
    var paths: string[][] = [['start']];
    while (paths.some((p) => !p.includes('end'))) {
      var tempPaths: string[][] = [];
      paths.forEach((path) => {
        if (!path.includes('end')) {
          nodes[path[path.length - 1]]
            .filter((n) => n != 'start')
            .forEach((node) => {
              if (
                isUpperCase(node) ||
                !path.includes(node) ||
                (allowSmallTwice && !isAnyTwice(path))
              ) {
                tempPaths.push([...path].concat([node]));
              }
            });
        } else {
          tempPaths.push(path);
        }
      });
      paths = tempPaths;
    }
    return paths;
  }

  generateSankeyData(
    paths: string[][]
  ): [number[], number[], number[], string[]] {
    var sources: number[] = [];
    var targets: number[] = [];
    var values: number[] = [];
    var labels: string[] = [];
    var edges: { l1: string; l2: string; v: number }[] = [];
    paths.forEach((path) => {
      for (let i = 0; i < path.length - 1; i++) {
        var n1 = path[i];
        var n2 = path[i + 1];
        var edge = edges.find((e) => e.l1 == n1 && e.l2 == n2);
        if (!edge) {
          edge = {
            l1: n1,
            l2: n2,
            v: 0,
          };
          edges.push(edge);
        }
        edge.v++;
      }
    });
    edges.forEach((edge) => {
      if (!labels.includes(edge.l1)) {
        labels.push(edge.l1);
      }
      if (!labels.includes(edge.l2)) {
        labels.push(edge.l2);
      }
      sources.push(labels.indexOf(edge.l1));
      targets.push(labels.indexOf(edge.l2));
      values.push(edge.v);
    });
    return [sources, targets, values, labels];
  }

  override solvePart1(input: string): PuzzleResult {
    var nodes = this.generateGraph(input);
    var paths: string[][] = this.generatePaths(nodes);
    var sources: number[] = [];
    var targets: number[] = [];
    var values: number[] = [];
    var labels: string[] = [];
    [sources, targets, values, labels] = this.generateSankeyData(paths);
    return {
      result: paths.length,
      component: CavesVisualizerComponent,
      componentData: {
        sources: sources,
        targets: targets,
        values: values,
        labels: labels,
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var nodes = this.generateGraph(input);
    var paths: string[][] = this.generatePaths(nodes, true);
    var sources: number[] = [];
    var targets: number[] = [];
    var values: number[] = [];
    var labels: string[] = [];
    [sources, targets, values, labels] = this.generateSankeyData(paths);
    return {
      result: paths.length,
      component: CavesVisualizerComponent,
      componentData: {
        sources: sources,
        targets: targets,
        values: values,
        labels: labels,
      },
    };
  }
}
