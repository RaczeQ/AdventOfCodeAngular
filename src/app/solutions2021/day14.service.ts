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
export class Day14Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2021, 14, 'Extended Polymerization');
  }

  private increaseKey(d: { [key: string]: number }, c: string, n: number = 1) {
    if (!(c in d)) {
      d[c] = 0;
    }
    d[c] += n;
    return d;
  }

  private buildTree(
    rules: string[][],
    depth: number,
    acc: { [depth: number]: { [key: string]: { [key: string]: number } } } = {}
  ): { [depth: number]: { [key: string]: { [key: string]: number } } } {
    acc[depth] = {};
    if (depth == 1) {
      rules.forEach((r) => {
        acc[depth][r[0]] = {};
        acc[depth][r[0]] = this.increaseKey(acc[depth][r[0]], r[1]);
      });
    } else {
      acc = this.buildTree(rules, depth - 1, acc);
      rules.forEach((r) => {
        acc[depth][r[0]] = {};
        acc[depth][r[0]][r[1]] = 1;
        var pairs = [];
        pairs.push(r[0][0] + r[1]);
        pairs.push(r[1] + r[0][1]);
        pairs.forEach((pair) => {
          if (pair in acc[depth - 1]) {
            var dict = acc[depth - 1][pair];
            Object.keys(dict).forEach((k) => {
              acc[depth][r[0]] = this.increaseKey(acc[depth][r[0]], k, dict[k]);
            });
          }
        });
      });
    }
    return acc;
  }

  private growPolymer(
    template: string,
    rules: string[][],
    steps: number
  ): { [key: string]: number }[] {
    var tree = this.buildTree(rules, steps);
    var results = [];
    for (let s = 0; s <= steps; s++) {
      var result: { [key: string]: number } = {};
      for (let index = 0; index < template.length - 1; index++) {
        result = this.increaseKey(result, template[index]);
        if (s in tree) {
          var pair = template[index] + template[index + 1];
          if (pair in tree[s]) {
            Object.keys(tree[s][pair]).forEach((k) => {
              result = this.increaseKey(result, k, tree[s][pair][k]);
            });
          }
        }
      }
      result = this.increaseKey(result, template[template.length - 1]);
      results.push(Object.assign({}, result));
    }
    return results;
  }

  override solvePart1(input: string): PuzzleResult {
    var steps = 10;
    var lines = splitIntoLines(input);
    var template = lines[0];
    var rules = lines.slice(2).map((l) => {
      return l.split('->').map((p) => p.trim());
    });
    var results = this.growPolymer(template, rules, steps);
    var lastResult = results[results.length - 1];
    var uniqueLetters = Object.keys(lastResult);
    return {
      result:
        Math.max(...Object.values(lastResult)) -
        Math.min(...Object.values(lastResult)),
      component: PlotlyGraphComponent,
      componentData: {
        graphData: uniqueLetters.map((l) => {
          return {
            x: results
              .map((r, idx) => {
                return { r, idx };
              })
              .filter((t) => l in t.r)
              .map((t) => t.idx),
            y: results.filter((r) => l in r).map((r) => r[l]),
            mode: 'lines+markers',
            type: 'scatter',
            name: l,
          };
        }),
        graphLayout: {
          yaxis: { title: 'Number of letters (log)', type: 'log' },
          xaxis: { title: 'Step' },
        },
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var steps = 40;
    var lines = splitIntoLines(input);
    var template = lines[0];
    var rules = lines.slice(2).map((l) => {
      return l.split('->').map((p) => p.trim());
    });
    var results = this.growPolymer(template, rules, steps);
    var lastResult = results[results.length - 1];
    var uniqueLetters = Object.keys(lastResult);
    return {
      result:
        Math.max(...Object.values(lastResult)) -
        Math.min(...Object.values(lastResult)),
      component: PlotlyGraphComponent,
      componentData: {
        graphData: uniqueLetters.map((l) => {
          return {
            x: results
              .map((r, idx) => {
                return { r, idx };
              })
              .filter((t) => l in t.r)
              .map((t) => t.idx),
            y: results.filter((r) => l in r).map((r) => r[l]),
            mode: 'lines+markers',
            type: 'scatter',
            name: l,
          };
        }),
        graphLayout: {
          yaxis: { title: 'Number of letters (log)', type: 'log' },
          xaxis: { title: 'Step' },
        },
      },
    };
  }
}
