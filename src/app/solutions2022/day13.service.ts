import { Injectable } from '@angular/core';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';
import { PacketNumbersVisualizerComponent } from './components/packet-numbers-visualizer/packet-numbers-visualizer.component';

export type PacketNumber = number | PacketNumber[];

function parseNumbers(input: string): PacketNumber[][] {
  return input.split('\n\n').map((group) =>
    splitIntoLines(group, true).map((line) => {
      var regexMatches = line.match(/(?!(\d|,|\[|\])+)/gs);
      if (regexMatches?.length && regexMatches?.length > 1) {
        throw Error('Wrong input');
      }
      var number = eval(line) as PacketNumber;
      return number;
    })
  );
}

function _compareNumbers(a: PacketNumber, b: PacketNumber): [boolean, boolean] {
  var result = true;
  var continueComparing = true;
  if (typeof a !== 'undefined' && typeof b === 'undefined') {
    // b is undefined
    result = false;
    continueComparing = false;
  } else if (typeof a === 'undefined' && typeof b !== 'undefined') {
    // a is undefined
    continueComparing = false;
  } else if (typeof a === 'number' && typeof b === 'number') {
    // both are numbers
    if (a > b) {
      result = false;
      continueComparing = false;
    } else if (a < b) {
      result = true;
      continueComparing = false;
    }
  } else if (typeof a !== 'number' && typeof b === 'number') {
    // a is not a number
    [result, continueComparing] = _compareNumbers(a, [b]);
  } else if (typeof a === 'number' && typeof b !== 'number') {
    // b is not a number
    [result, continueComparing] = _compareNumbers([a], b);
  } else {
    // a and b are arrays
    a = a as PacketNumber[];
    b = b as PacketNumber[];
    for (let index = 0; index < Math.max(a.length, b.length); index++) {
      [result, continueComparing] = _compareNumbers(a[index], b[index]);
      if (!continueComparing) {
        break;
      }
    }
  }
  return [result, continueComparing];
}

function compareNumbers(a: PacketNumber, b: PacketNumber): boolean {
  var [result, _] = _compareNumbers(a, b);
  return result;
}

@Injectable({
  providedIn: 'root',
})
export class Day13Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2022, 13, 'Distress Signal');
  }
  override solvePart1(input: string): PuzzleResult {
    var numbers = parseNumbers(input);
    var indexes = numbers
      .map((pair, idx) =>
        compareNumbers(pair[0], pair[1]) ? idx + 1 : undefined
      )
      .filter((n) => n);
    return {
      result: indexes.sum(),
      component: PacketNumbersVisualizerComponent,
      componentData: {
        packetNumbers: numbers,
        highlightIndexes: indexes.map((idx) => [idx! - 1, 0]),
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var numbers = parseNumbers(input)
      .flatMap((pair) => pair)
      .concat([[[2]], [[6]]])
      .map((packetNumber, index) => {
        return { packetNumber, index };
      })
      .sort((a, b) =>
        compareNumbers(a.packetNumber, b.packetNumber) ? -1 : 1
      );
    var firstDividerPacketIndex =
      numbers.findIndex((tuple) => tuple.index == numbers.length - 2) + 1;
    var secondDividerPacketIndex =
      numbers.findIndex((tuple) => tuple.index == numbers.length - 1) + 1;
    return {
      result: firstDividerPacketIndex * secondDividerPacketIndex,
      component: PacketNumbersVisualizerComponent,
      componentData: {
        packetNumbers: [numbers.map((v) => v.packetNumber)],
        highlightIndexes: [
          [0, firstDividerPacketIndex - 1],
          [0, secondDividerPacketIndex - 1],
        ],
      },
    };
  }
}
