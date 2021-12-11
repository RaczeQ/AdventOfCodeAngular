import { Injectable } from '@angular/core';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';
import { SyntaxErrorLinesVisualizerComponent } from './components/syntax-error-lines-visualizer/syntax-error-lines-visualizer.component';

function median(numbers: number[]) {
  const sorted = numbers.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

@Injectable({
  providedIn: 'root',
})
export class Day10Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2021, 10, 'Syntax Scoring');
  }
  override solvePart1(input: string): PuzzleResult {
    var scores = [3, 57, 1197, 25137];
    var openChars = ['(', '[', '{', '<'];
    var closeChars = [')', ']', '}', '>'];
    var okPairs: string[] = [];
    var wrongPairs: string[] = [];
    openChars.forEach((oc, i) => {
      closeChars.forEach((cc, j) => {
        if (i == j) {
          okPairs.push(oc + cc);
        } else {
          wrongPairs.push(oc + cc);
        }
      });
    });
    var lines = splitIntoLines(input);
    var calculatedScores: number[] = [];
    var filteredLines: string[] = [];
    var corruptedPairs: string[] = [];
    lines.forEach((line) => {
      var corrutpedPair = '';
      var lineCopy = line.toString();
      var lastLength = lineCopy.length + 1;
      while (corrutpedPair.length == 0 && lineCopy.length != lastLength) {
        lastLength = lineCopy.length;
        okPairs.forEach((pair) => {
          lineCopy = lineCopy.replace(pair, '');
        });
        wrongPairs.forEach((pair) => {
          var idx = lineCopy.indexOf(pair);
          if (idx && idx >= 0) {
            corrutpedPair = pair;
          }
        });
      }
      if (corrutpedPair.length > 0) {
        filteredLines.push(line);
        corruptedPairs.push(corrutpedPair);
        calculatedScores.push(scores[closeChars.indexOf(corrutpedPair[1])]);
      }
    });
    return {
      result: calculatedScores.reduce((a, b) => a + b),
      component: SyntaxErrorLinesVisualizerComponent,
      componentData: {
        lines: filteredLines,
        results: corruptedPairs,
        scores: calculatedScores,
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var scores = [1, 2, 3, 4];
    var openChars = ['(', '[', '{', '<'];
    var closeChars = [')', ']', '}', '>'];
    var okPairs: string[] = [];
    var wrongPairs: string[] = [];
    var calculatedScores: number[] = [];
    var filteredLines: string[] = [];
    var incompleteLines: string[] = [];
    openChars.forEach((oc, i) => {
      closeChars.forEach((cc, j) => {
        if (i == j) {
          okPairs.push(oc + cc);
        } else {
          wrongPairs.push(oc + cc);
        }
      });
    });
    var lines = splitIntoLines(input);
    lines.forEach((line) => {
      var isCorrupted = false;
      var lineCopy = line.toString();
      var lastLength = lineCopy.length + 1;
      while (!isCorrupted && lineCopy.length != lastLength) {
        lastLength = lineCopy.length;
        okPairs.forEach((pair) => {
          lineCopy = lineCopy.replace(pair, '');
        });
        wrongPairs.forEach((pair) => {
          var idx = lineCopy.indexOf(pair);
          if (idx && idx >= 0 && idx < line.length) {
            isCorrupted = true;
          }
        });
      }
      if (!isCorrupted) {
        console.log(lineCopy);
        calculatedScores.push(
          lineCopy
            .split('')
            .reverse()
            .map((c) => scores[openChars.indexOf(c)])
            .reduce((a, b) => 5 * a + b)
        );
        filteredLines.push(line);
        incompleteLines.push(lineCopy);
      }
    });
    var medianScore = median(calculatedScores);
    return {
      result: medianScore,
      component: SyntaxErrorLinesVisualizerComponent,
      componentData: {
        lines: filteredLines,
        results: incompleteLines,
        scores: calculatedScores,
        medianScore: medianScore,
      },
    };
  }
}
