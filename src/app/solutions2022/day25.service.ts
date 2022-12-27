import { Injectable } from '@angular/core';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';
import { SnafuNumbersVisualizerComponent } from './components/snafu-numbers-visualizer/snafu-numbers-visualizer.component';

function fromSNAFU(value: string): number {
  return value
    .split('')
    .reverse()
    .map((char, idx) => {
      var base = Math.pow(5, idx);
      switch (char) {
        case '=':
          return base * -2;
        case '-':
          return base * -1;
        default:
          return base * Number(char);
      }
    })
    .sum();
}

// Inspired by u/ai_prof
// https://www.reddit.com/r/adventofcode/comments/zur1an/comment/j1qmqf1/
function toSNAFU(value: number): string {
  if (value == 0) return '';

  var quotient = Math.floor(value / 5);
  switch (value % 5) {
    case 3:
      return toSNAFU(1 + quotient) + '=';
    case 4:
      return toSNAFU(1 + quotient) + '-';
    default:
      return toSNAFU(quotient) + (value % 5).toString();
  }
}

@Injectable({
  providedIn: 'root',
})
export class Day25Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2022, 25, 'Full of Hot Air');
  }
  override solvePart1(input: string): PuzzleResult {
    var lines = splitIntoLines(input, true);
    var numbers = lines.map(fromSNAFU);
    var numbersSum = numbers.sum();
    var snafuNumber = toSNAFU(numbersSum);
    return {
      result: snafuNumber,
      component: SnafuNumbersVisualizerComponent,
      componentData: {
        snafuNumbers: lines,
        parsedNumbers: numbers,
        finalNumber: numbersSum,
        finalSnafuNumber: snafuNumber,
      },
    };
  }
  override solvePart2(input: string): number {
    return 0;
  }
}
