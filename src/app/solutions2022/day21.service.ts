import { Injectable } from '@angular/core';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { Queue } from '../helper/util-functions/queue';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';
import { MonkeyMathEquationsVisualizerComponent } from './components/monkey-math-equations-visualizer/monkey-math-equations-visualizer.component';

export interface MathMonkey {
  depth?: number;
  yellNumber: () => number;
  numberCache?: number;
  equation: string;
  monkeyLeft?: string;
  monkeyRight?: string;
}

function parseMathMonkeys(input: string): { [monkeyName: string]: MathMonkey } {
  var result: { [monkeyName: string]: MathMonkey } = {};
  splitIntoLines(input, true).forEach((line) => {
    var parts = line.split(' ');
    var monkeyName = parts[0].slice(0, -1);
    if (parts.length == 2) {
      result[monkeyName] = {
        yellNumber: () => {
          if (result[monkeyName].numberCache === undefined) {
            result[monkeyName].numberCache = Number(parts[1]);
          }
          return result[monkeyName].numberCache!;
        },
        equation: parts.slice(1).join(''),
      };
    } else {
      var monkeyLeft = parts[1];
      var monkeyRight = parts[3];
      var monkey = {
        monkeyLeft,
        monkeyRight,
        equation: parts.slice(1).join(''),
        yellNumber: () => 0,
      };
      switch (parts[2]) {
        case '+':
          monkey.yellNumber = () => {
            if (result[monkeyName].numberCache === undefined) {
              result[monkeyName].numberCache =
                result[monkeyLeft].yellNumber() +
                result[monkeyRight].yellNumber();
            }
            return result[monkeyName].numberCache!;
          };

          break;
        case '-':
          monkey.yellNumber = () => {
            if (result[monkeyName].numberCache === undefined) {
              result[monkeyName].numberCache =
                result[monkeyLeft].yellNumber() -
                result[monkeyRight].yellNumber();
            }
            return result[monkeyName].numberCache!;
          };
          break;
        case '*':
          monkey.yellNumber = () => {
            if (result[monkeyName].numberCache === undefined) {
              result[monkeyName].numberCache =
                result[monkeyLeft].yellNumber() *
                result[monkeyRight].yellNumber();
            }
            return result[monkeyName].numberCache!;
          };
          break;
        case '/':
          monkey.yellNumber = () => {
            if (result[monkeyName].numberCache === undefined) {
              result[monkeyName].numberCache =
                result[monkeyLeft].yellNumber() /
                result[monkeyRight].yellNumber();
            }
            return result[monkeyName].numberCache!;
          };
          break;
      }
      result[monkeyName] = monkey;
    }
  });
  return result;
}

function addTreeDepth(monkeys: { [monkeyName: string]: MathMonkey }) {
  var queue = new Queue<[string, number]>();
  queue.enqueue(['root', 0]);
  while (!queue.isEmpty()) {
    var [monkeyName, depth] = queue.dequeue()!;
    var currentMonkey = monkeys[monkeyName];
    currentMonkey.depth = depth;
    if (currentMonkey.monkeyLeft !== undefined) {
      queue.enqueue([currentMonkey.monkeyLeft!, depth + 1]);
      queue.enqueue([currentMonkey.monkeyRight!, depth + 1]);
    }
  }
}

function buildEquation(monkeys: {
  [monkeyName: string]: MathMonkey;
}): [string, string] {
  var usedMonkeys = new Set<string>(['root', 'humn']);
  var leftEquation = monkeys['root'].monkeyLeft!;
  var rightEquation = monkeys['root'].monkeyRight!;
  var monkeysLeft = Object.keys(monkeys).filter(
    (monkeyName) => !usedMonkeys.has(monkeyName)
  );
  while (monkeysLeft.length > 0) {
    monkeysLeft.forEach((monkeyName) => {
      if (
        leftEquation.includes(monkeyName) ||
        rightEquation.includes(monkeyName)
      ) {
        usedMonkeys.add(monkeyName);
        var value = monkeys[monkeyName].equation;
        if (monkeys[monkeyName].monkeyLeft !== undefined) {
          value = `(${value})`;
        }
        leftEquation = leftEquation.replace(monkeyName, value);
        rightEquation = rightEquation.replace(monkeyName, value);
      }
    });

    var monkeysLeft = Object.keys(monkeys).filter(
      (monkeyName) => !usedMonkeys.has(monkeyName)
    );
  }
  return [leftEquation, rightEquation];
}

export interface EquationComponent {
  left: string | number | EquationComponent;
  operator: string;
  right: string | number | EquationComponent;
}

function parseEquation(
  line: string,
  idx: number = 0
): [EquationComponent, number] {
  var result: EquationComponent = {
    left: '',
    operator: '',
    right: '',
  };
  idx++;
  if (line[idx] != '(') {
    var startIdx = idx;
    while (!['+', '-', '/', '*'].includes(line[idx])) {
      idx++;
    }
    result.left = line.slice(startIdx, idx);
    result.operator = line[idx];
  } else {
    [result.left, idx] = parseEquation(line, idx);
  }
  result.operator = line[idx];
  idx++;
  if (line[idx] != '(') {
    var startIdx = idx;
    while (line[idx] != ')') {
      idx++;
    }
    result.right = line.slice(startIdx, idx);
  } else {
    [result.right, idx] = parseEquation(line, idx);
  }
  idx++;
  return [result, idx];
}

function evaluateAllBranches(
  equation: EquationComponent
): EquationComponent | number {
  if (Object.keys(equation.left).includes('left')) {
    equation.left = evaluateAllBranches(equation.left as EquationComponent);
  }
  if (Object.keys(equation.right).includes('left')) {
    equation.right = evaluateAllBranches(equation.right as EquationComponent);
  }
  if (
    !Object.keys(equation.left).includes('left') &&
    equation.left != 'humn' &&
    !Object.keys(equation.right).includes('left') &&
    equation.right != 'humn'
  ) {
    return eval(`${equation.left} ${equation.operator} ${equation.right}`);
  }
  return equation;
}

function hasHuman(equation: EquationComponent) {
  if (
    Object.keys(equation.left).includes('left') &&
    hasHuman(equation.left as EquationComponent)
  ) {
    return true;
  }
  if (
    Object.keys(equation.right).includes('left') &&
    hasHuman(equation.right as EquationComponent)
  ) {
    return true;
  }
  return equation.left == 'humn' || equation.right == 'humn';
}

function copyEquation(equation: EquationComponent): EquationComponent {
  var [eq, _] = parseEquation(
    printEquation(equation as EquationComponent, false)
  );
  return eq;
}

function solveHumanNumber(
  rawLeftEquation: string,
  rawRightEquation: string
): {
  humanNumber: number;
  leftEquation: EquationComponent;
  leftEquationCollapsed: EquationComponent;
  rightEquation: EquationComponent;
  rightEquationCollapsed: EquationComponent;
  finalEquation: EquationComponent;
  finalEquationCollapsed: EquationComponent;
} {
  var [leftEquation, _] = parseEquation(rawLeftEquation);
  var [leftEquationSnapshot, _] = parseEquation(rawLeftEquation);
  var [leftEquationSnapshotCollapsed, _] = parseEquation(rawLeftEquation);
  var [rightEquation, _] = parseEquation(rawRightEquation);
  var [rightEquationSnapshot, _] = parseEquation(rawRightEquation);
  var [rightEquationSnapshotCollapsed, _] = parseEquation(rawRightEquation);
  var leftEquation = evaluateAllBranches(leftEquation) as EquationComponent;
  var rightEquation = evaluateAllBranches(rightEquation) as EquationComponent;
  var leftEquationSnapshotCollapsed = evaluateAllBranches(
    leftEquationSnapshotCollapsed
  ) as EquationComponent;
  var rightEquationSnapshotCollapsed = evaluateAllBranches(
    rightEquationSnapshotCollapsed
  ) as EquationComponent;

  var currentEquation: EquationComponent = leftEquation as EquationComponent;
  var fullyParsed = false;
  while (!fullyParsed) {
    if (currentEquation.left == 'humn' || currentEquation.right == 'humn') {
      fullyParsed = true;
    }

    var nextEquation: EquationComponent;
    var currentNumber: number;
    var isRight: boolean;
    if (
      Object.keys(currentEquation.left).includes('left') ||
      currentEquation.left == 'humn'
    ) {
      nextEquation = currentEquation.left as EquationComponent;
      currentNumber = Number(currentEquation.right);
      isRight = true;
    } else {
      nextEquation = currentEquation.right as EquationComponent;
      currentNumber = Number(currentEquation.left);
      isRight = false;
    }
    switch (currentEquation.operator) {
      case '+':
        rightEquation = {
          left: rightEquation,
          operator: '-',
          right: currentNumber,
        };
        break;
      case '-':
        if (isRight) {
          rightEquation = {
            left: rightEquation,
            operator: '+',
            right: currentNumber,
          };
        } else {
          rightEquation = {
            left: currentNumber,
            operator: '-',
            right: rightEquation,
          };
        }
        break;
      case '*':
        rightEquation = {
          left: rightEquation,
          operator: '/',
          right: currentNumber,
        };
        break;
      case '/':
        if (isRight) {
          rightEquation = {
            left: rightEquation,
            operator: '*',
            right: currentNumber,
          };
        } else {
          rightEquation = {
            left: currentNumber,
            operator: '/',
            right: rightEquation,
          };
        }
        break;
    }
    currentEquation = nextEquation;
  }

  var finalEquationSnapshot = copyEquation(rightEquation as EquationComponent);

  var finalNumber = evaluateAllBranches(
    rightEquation as EquationComponent
  ) as number;

  return {
    humanNumber: finalNumber,
    leftEquation: leftEquationSnapshot,
    rightEquation: rightEquationSnapshot,
    finalEquation: finalEquationSnapshot,
    leftEquationCollapsed: leftEquationSnapshotCollapsed,
    rightEquationCollapsed: rightEquationSnapshotCollapsed,
    finalEquationCollapsed: rightEquation,
  };
}

export function printEquation(
  equation: EquationComponent | number,
  isFirst = true
): string {
  if (!Object.keys(equation).includes('left')) {
    return equation.toString();
  }
  equation = equation as EquationComponent;
  var leftPart: string;
  var rightPart: string;
  if (Object.keys(equation.left).includes('left')) {
    leftPart = printEquation(equation.left as EquationComponent, false);
  } else {
    leftPart = equation.left as string;
  }
  if (Object.keys(equation.right).includes('left')) {
    rightPart = printEquation(equation.right as EquationComponent, false);
  } else {
    rightPart = equation.right as string;
  }

  var result = `(${leftPart}${equation.operator}${rightPart})`;
  if (isFirst) {
    result = result.slice(1, -1);
  }
  return result;
}

@Injectable({
  providedIn: 'root',
})
export class Day21Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2022, 21, 'Monkey Math');
  }
  override solvePart1(input: string): PuzzleResult {
    var monkeys = parseMathMonkeys(input);
    addTreeDepth(monkeys);
    var result = monkeys['root'].yellNumber();
    return {
      result: result,
      component: MonkeyMathEquationsVisualizerComponent,
      componentData: {
        monkeys,
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var monkeys = parseMathMonkeys(input);
    var [leftEquation, rightEquation] = buildEquation(monkeys);
    var equation: string = '';
    var secondEquation: string = '';
    if (leftEquation.includes('humn')) {
      equation = leftEquation;
      secondEquation = rightEquation;
    } else {
      equation = rightEquation;
      secondEquation = leftEquation;
    }
    var result = solveHumanNumber(equation, secondEquation);
    return {
      result: result.humanNumber,
      component: MonkeyMathEquationsVisualizerComponent,
      componentData: {
        equationData: result,
      },
    };
  }
}
