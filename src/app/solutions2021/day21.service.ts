import { Injectable } from '@angular/core';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';

// https://stackoverflow.com/a/15310051
function cartesian(...args: number[][]) {
  var r: number[][] = [],
    max = args.length - 1;
  function helper(arr: number[], i: number) {
    for (var j = 0, l = args[i].length; j < l; j++) {
      var a = arr.slice(0); // clone arr
      a.push(args[i][j]);
      if (i == max) r.push(a);
      else helper(a, i + 1);
    }
  }
  helper([], 0);
  return r;
}

@Injectable({
  providedIn: 'root',
})
export class Day21Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2021, 21, 'Dirac Dice');
  }

  override solvePart1(input: string): PuzzleResult {
    var lines = splitIntoLines(input);
    var positions: number[] = [];
    var scores: number[] = [];
    var scoreSnapshots: number[][] = [[...scores]];
    lines.forEach((l) => {
      positions.push(Number(l.split(' ').slice(-1)[0]) - 1);
      scores.push(0);
    });
    const diceSize = 100;
    const boardSize = 10;
    var currentRoll = 0;
    var totalRolls = 0;
    var currentPlayer = 0;
    while (scores.every((s) => s < 1000)) {
      var roll = 0;
      for (let index = 0; index < 3; index++) {
        currentRoll = ++currentRoll % diceSize;
        roll += currentRoll;
        totalRolls++;
      }
      positions[currentPlayer] = (positions[currentPlayer] + roll) % boardSize;
      scores[currentPlayer] += positions[currentPlayer] + 1;
      scoreSnapshots.push([...scores]);
      currentPlayer = ++currentPlayer % 2;
    }
    return {
      result: totalRolls * Math.min(...scores),
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            x: scoreSnapshots.map((s, idx) => (idx + 1) * 3),
            y: scoreSnapshots.map((s) => s[0]),
            mode: 'lines',
            name: 'Player 1',
          },
          {
            x: scoreSnapshots.map((s, idx) => (idx + 1) * 3),
            y: scoreSnapshots.map((s) => s[1]),
            mode: 'lines',
            name: 'Player 2',
          },
        ],
        graphLayout: {
          yaxis: { title: 'Score' },
          xaxis: { title: 'Dice rolls' },
        },
      },
    };
  }

  private resultsCache: { [key: string]: [number, number] } = {};

  private playGame(
    p1: number,
    p2: number,
    s1: number,
    s2: number,
    possibleRolls: number[],
    boardSize: number = 10,
    winValue: number = 21
  ) {
    var key = `${p1}_${p2}_${s1}_${s2}`;
    if (key in this.resultsCache) {
      return this.resultsCache[key];
    }
    if (s1 >= winValue) {
      return [1, 0];
    }
    if (s2 >= winValue) {
      return [0, 1];
    }
    var [totalP1Wins, totalP2Wins] = [0, 0];
    possibleRolls.forEach((roll) => {
      var pos = (p1 + roll) % 10;
      var scr = s1 + pos + 1;
      var [p2Wins, p1Wins] = this.playGame(
        p2,
        pos,
        s2,
        scr,
        possibleRolls,
        boardSize,
        winValue
      );
      totalP1Wins += p1Wins;
      totalP2Wins += p2Wins;
    });
    this.resultsCache[key] = [totalP1Wins, totalP2Wins];
    return [totalP1Wins, totalP2Wins];
  }

  override solvePart2(input: string): PuzzleResult {
    var lines = splitIntoLines(input);
    var positions: number[] = [];
    lines.forEach((l) => {
      positions.push(Number(l.split(' ').slice(-1)[0]) - 1);
    });
    var result = 0;
    var diceSize = 3;
    var diceRolls = Array.from(Array(diceSize).keys()).map((r) => r + 1);
    var possibleRolls = cartesian(diceRolls, diceRolls, diceRolls);
    var possibleRollsSums = possibleRolls.map((r) => r.reduce((a, b) => a + b));
    var boardSize = 10;
    var results: number[][] = [];
    Array.from(Array(boardSize).keys()).forEach((p1) => {
      Array.from(Array(boardSize).keys()).forEach((p2) => {
        var wonGames = this.playGame(p1, p2, 0, 0, possibleRollsSums);
        if (p1 == positions[0] && p2 == positions[1]) {
          result = Math.max(...wonGames);
        }
        results.push([p1, p2, wonGames[0] / (wonGames[0] + wonGames[1])]);
      });
    });
    return {
      result: result,
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            x: results.map((r) => r[0] + 1),
            y: results.map((r) => r[1] + 1),
            z: results.map((r) => r[2] * 100),
            colorscale: 'Portland',
            type: 'heatmap',
            colorbar: {
              title: 'P1 Wins %',
              titlefont: {
                color: '#ffffff',
              },
              tickfont: {
                color: '#ffffff',
              },
            },
          },
          {
            x: [positions[0] + 1],
            y: [positions[1] + 1],
            mode: 'markers',
            marker: {
              size: 10,
              color: '#fff',
              line: {
                color: '#000',
                width: 2,
              },
            },
          },
        ],
        graphLayout: {
          yaxis: {
            title: 'Player 2 starting position',
            range: [boardSize + 0.5, 1 - 0.5],
          },
          xaxis: {
            title: 'Player 1 starting position',
            range: [1 - 0.5, boardSize + 0.5],
            side: 'top',
          },
        },
      },
    };
  }
}
