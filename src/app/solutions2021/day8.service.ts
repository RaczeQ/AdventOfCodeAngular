import { Injectable } from '@angular/core';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';
import { SevenSegmentsDisplayVisualizerComponent } from './components/seven-segments-display-visualizer/seven-segments-display-visualizer.component';

export interface Display {
  signals: string[][];
  output: string[][];
}

@Injectable({
  providedIn: 'root',
})
export class Day8Service
  extends BaseSolutionService
  implements ISolutionService
{
  private static readonly NUMBERS: { [number: number]: string[] } = {
    0: ['a', 'b', 'c', 'e', 'f', 'g'],
    1: ['c', 'f'],
    2: ['a', 'c', 'd', 'e', 'g'],
    3: ['a', 'c', 'd', 'f', 'g'],
    4: ['b', 'c', 'd', 'f'],
    5: ['a', 'b', 'd', 'f', 'g'],
    6: ['a', 'b', 'd', 'e', 'f', 'g'],
    7: ['a', 'c', 'f'],
    8: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    9: ['a', 'b', 'c', 'd', 'f', 'g'],
  };
  parseSegment(segment: string): string[][] {
    return segment
      .split(' ')
      .filter((segment) => segment.trim().length > 0)
      .map((segment) => segment.trim().split(''));
  }
  parseSignals(input: string): Display[] {
    var result: Display[] = [];
    var lines = splitIntoLines(input);
    result = lines
      .filter((l) => l.trim().length > 0)
      .map((line) => {
        var segments = line.split('|');
        return {
          signals: this.parseSegment(segments[0]),
          output: this.parseSegment(segments[1]),
        };
      });
    return result;
  }
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2021, 8, 'Seven Segment Search');
  }
  override solvePart1(input: string): PuzzleResult {
    var signals = this.parseSignals(input);
    return {
      result: signals
        .flatMap((s) =>
          s.output.filter((o) => o.length != 5 && o.length != 6).map((o) => 1)
        )
        .reduce((a, b) => a + b),
      component: SevenSegmentsDisplayVisualizerComponent,
      componentData: {
        inputDisplays: signals,
        accentUniqueLengths: true,
      },
    };
  }

  generateCombinations(segments: {
    [segment: string]: string[];
  }): { [segment: string]: string }[] {
    var combinations: string[][] = [[]];
    Object.keys(segments).forEach((key: string) => {
      var tempCombinations: string[][] = [];
      segments[key].forEach((segment) => {
        combinations.forEach((combination) => {
          if (!combination.includes(segment)) {
            var newCombination = [...combination];
            newCombination.push(segment);
            tempCombinations.push(newCombination);
          }
        });
      });
      combinations = tempCombinations;
    });
    return combinations.map((combination) => {
      var obj: { [segment: string]: string } = {};
      Day8Service.NUMBERS[8].forEach((char, idx) => {
        obj[combination[idx]] = char;
      });
      return obj;
    });
  }

  override solvePart2(input: string): PuzzleResult {
    var displays = this.parseSignals(input);
    var decodedDisplays: Display[] = [];
    var uniqueDigits = [1, 4, 7];
    var numbers = displays.map((display) => {
      var segments: { [segment: string]: string[] } = {
        a: Day8Service.NUMBERS[8],
        b: Day8Service.NUMBERS[8],
        c: Day8Service.NUMBERS[8],
        d: Day8Service.NUMBERS[8],
        e: Day8Service.NUMBERS[8],
        f: Day8Service.NUMBERS[8],
        g: Day8Service.NUMBERS[8],
      };
      display.signals.forEach((signal, idx) => {
        uniqueDigits.forEach((digit) => {
          if (signal.length == Day8Service.NUMBERS[digit].length) {
            signal.forEach((segment) => {
              // Might remove if necessary
              if (
                segments[segment].length > Day8Service.NUMBERS[digit].length
              ) {
                var difference = Day8Service.NUMBERS[8].filter(
                  (c) => !Day8Service.NUMBERS[digit].includes(c)
                );
                var tempSegment = segments[segment].filter(
                  (c) => !difference.includes(c)
                );
                segments[segment] = tempSegment;
              }
            });
          }
        });
      });
      var combinations = this.generateCombinations(segments);
      var goodCombination: { [segment: string]: string } = {};
      combinations.forEach((combination, idx) => {
        if (Object.keys(goodCombination).length == 0) {
          var isGoodCombination = true;
          display.signals.forEach((signal) => {
            if (isGoodCombination) {
              var availableNumbers = Object.values(Day8Service.NUMBERS).filter(
                (n) => n.length == signal.length
              );
              var mappedNumbers = availableNumbers.map((num) =>
                num.map((char) => combination[char])
              );
              isGoodCombination = mappedNumbers.some((num) =>
                num.every((n) => signal.includes(n))
              );
            }
          });
          if (isGoodCombination) {
            goodCombination = combination;
          }
        }
      });
      var number = 0;
      if (Object.keys(goodCombination).length > 0) {
        display.output.forEach((signal, idx) => {
          // var mappedSignal = signal.map(c => goodCombination[c]);
          var digit = Object.keys(Day8Service.NUMBERS)
            .map(Number)
            .filter((k) => Day8Service.NUMBERS[k].length == signal.length)
            .find((k) =>
              Day8Service.NUMBERS[k]
                .map((char) => goodCombination[char])
                .every((n) => signal.includes(n))
            );
          number += Math.pow(10, 3 - idx) * digit!;
        });
      }
      decodedDisplays.push({
        signals: display.signals.map((signal) =>
          signal.map(
            (s) =>
              Object.keys(goodCombination).find((k) => goodCombination[k] == s)!
          )
        ),
        output: display.output.map((signal) =>
          signal.map(
            (s) =>
              Object.keys(goodCombination).find((k) => goodCombination[k] == s)!
          )
        ),
      });
      return number;
    });
    return {
      result: numbers.reduce((a, b) => a + b),
      component: SevenSegmentsDisplayVisualizerComponent,
      componentData: {
        inputDisplays: displays,
        decodedDisplays: decodedDisplays,
      },
    };
  }
}
