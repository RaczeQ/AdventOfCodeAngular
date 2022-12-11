import { Injectable } from '@angular/core';
import { range } from 'rxjs';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { BigStringInteger } from '../helper/util-functions/big-number';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';

export interface Monkey {
  items: BigStringInteger[];
  operation: (x: BigStringInteger) => BigStringInteger;
  divisibleBy: number;
  trueMonkeyIndex: number;
  falseMonkeyIndex: number;
  inspections: number;
}

function parseMonkey(input: string): Monkey {
  var lines = splitIntoLines(input, true);
  var items = lines[1]
    .slice(16)
    .split(', ')
    .map((x) => new BigStringInteger(x));
  var operationComponents = lines[2].slice(17).split(' ');
  var divisibleBy = Number(lines[3].split(' ').slice(-1)[0]);
  var monkeyTrue = Number(lines[4].split(' ').slice(-1)[0]);
  var monkeyFalse = Number(lines[5].split(' ').slice(-1)[0]);
  return {
    items,
    inspections: 0,
    operation: (x: BigStringInteger) => {
      var leftNumber = x;
      var rightNumber =
        operationComponents[2] === 'old'
          ? x
          : new BigStringInteger(operationComponents[2]);
      if (operationComponents[1] === '+') {
        return leftNumber.add(rightNumber);
      } else if (operationComponents[1] === '*') {
        return leftNumber.multiply(rightNumber);
      }

      throw Error('Undefined operation: ' + operationComponents[1]);
    },
    divisibleBy: divisibleBy,
    trueMonkeyIndex: monkeyTrue,
    falseMonkeyIndex: monkeyFalse,
  };
}

function executeRound(monkeys: Monkey[], isPart1: boolean): Monkey[] {
  var newMonkeys: Monkey[] = monkeys.map((monkey) => {
    return {
      items: monkey.items.map((item) => item),
      operation: monkey.operation,
      divisibleBy: monkey.divisibleBy,
      trueMonkeyIndex: monkey.trueMonkeyIndex,
      falseMonkeyIndex: monkey.falseMonkeyIndex,
      inspections: monkey.inspections,
    };
  });
  newMonkeys.forEach((monkey) => {
    while (monkey.items.length > 0) {
      var item = monkey.items.shift()!;
      var newItem: BigStringInteger;
      if (isPart1) {
        newItem = monkey.operation(item);
        newItem = BigStringInteger.fromNumber(
          Math.floor(monkey.operation(item).toNumber() / 3)
        );
      } else {
        var common = newMonkeys.reduce(
          (total: BigStringInteger, curr: Monkey) =>
            total.multiply(BigStringInteger.fromNumber(curr.divisibleBy)),
          BigStringInteger.fromNumber(1)
        );
        newItem = BigStringInteger.fromBigInt(
          monkey.operation(item).toBigInt() % common.toBigInt()
        );
      }

      var throwDestination =
        newItem.mod(monkey.divisibleBy) == 0
          ? monkey.trueMonkeyIndex
          : monkey.falseMonkeyIndex;
      newMonkeys[throwDestination].items.push(newItem);
      monkey.inspections++;
    }
  });

  return newMonkeys;
}

function executeRoundsPart1(input: string, numberOfRounds: number): Monkey[][] {
  var monkeys = input.split('\n\n').map(parseMonkey);
  var monkeysSnapshots = [monkeys];
  Array.range(0, numberOfRounds).forEach((idx) => {
    if ((idx + 1) % 100 == 0) {
      console.log(idx + 1);
    }
    monkeysSnapshots.push(executeRound(monkeysSnapshots[idx], true));
  });
  return monkeysSnapshots;
}

function executeRoundsPart2(input: string, numberOfRounds: number): Monkey[][] {
  var monkeys = input.split('\n\n').map(parseMonkey);
  var monkeysSnapshots = [monkeys];
  Array.range(0, numberOfRounds).forEach((idx) => {
    if ((idx + 1) % 100 == 0) {
      console.log(idx + 1);
    }
    monkeysSnapshots.push(executeRound(monkeysSnapshots[idx], false));
  });
  return monkeysSnapshots;
}

@Injectable({
  providedIn: 'root',
})
export class Day11Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2022, 11, 'Monkey in the Middle');
  }
  override solvePart1(input: string): PuzzleResult {
    var numberOfRounds = 20;
    var monkeysSnapshots = executeRoundsPart1(input, numberOfRounds);
    var result = monkeysSnapshots[numberOfRounds]
      .map((monkey) => monkey.inspections)
      .sort((a, b) => b - a)
      .slice(0, 2)
      .product();
    return {
      result: result,
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [],
        graphLayout: {},
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var numberOfRounds = 10000;
    var monkeysSnapshots = executeRoundsPart2(input, numberOfRounds);
    console.log(monkeysSnapshots[numberOfRounds]);
    var result = monkeysSnapshots[numberOfRounds]
      .map((monkey) => monkey.inspections)
      .sort((a, b) => b - a)
      .slice(0, 2)
      .product();
    var numberOfMonkeys = monkeysSnapshots[0].length;
    var xArray = Array.range(1, numberOfRounds + 1);
    return {
      result: result,
      component: PlotlyGraphComponent,
      componentData: {
        graphData: Array.range(0, numberOfMonkeys).map((monkeyIndex) => {
          return {
            x: xArray,
            y: xArray.map(
              (x) => monkeysSnapshots[x - 1][monkeyIndex].inspections
            ),
            mode: 'lines',
            name: 'Monkey #' + (monkeyIndex + 1),
          };
        }),

        graphLayout: {
          yaxis: { title: 'Inspections' },
          xaxis: { title: 'Rounds' },
        },
      },
    };
  }
}
