import { Injectable } from '@angular/core';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { parseIntoNumbers } from '../helper/util-functions/parse-into-numbers';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';
import '../helper/util-functions/sum';

const player1moves: { [move: string]: number } = {
  A: 1,
  B: 2,
  C: 3,
};

const player2moves: { [move: string]: number } = {
  X: 1,
  Y: 2,
  Z: 3,
};

const roundResult: { [move: string]: number } = {
  X: 0,
  Y: 3,
  Z: 6,
};

const winnerMap: { [move: number]: number } = {
  1: 2,
  2: 3,
  3: 1,
};

function round1Score(round: string): [number, number] {
  var moves = round.split(' ');
  var move1 = moves[0];
  var move2 = moves[1];

  var player1move = player1moves[move1];
  var player2move = player2moves[move2];

  var score = 0;
  if (player2move == winnerMap[player1move]) {
    score = 6;
  } else if (player1move == player2move) {
    score = 3;
  }
  return [score, player2move];
}

function round2Score(round: string): [number, number] {
  var moves = round.split(' ');
  var move1 = moves[0];
  var move2 = moves[1];

  var player1move = player1moves[move1];
  var player2move = -1;

  var score = roundResult[move2];
  if (score == 6) {
    player2move = winnerMap[player1move];
  } else if (score == 3) {
    player2move = player1move;
  } else {
    player2move = player1move - 1;
    if (player2move == 0) {
      player2move = 3;
    }
  }
  return [score, player2move];
}

@Injectable({
  providedIn: 'root',
})
export class Day2Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2022, 2, 'Rock Paper Scissors');
  }

  override solvePart1(input: string): PuzzleResult {
    var rounds = splitIntoLines(input);
    var scores = rounds.map(round1Score);
    var roundScores = scores.map((x) => x[0]);
    var moveScores = scores.map((x) => x[1]);
    var result = roundScores.sum() + moveScores.sum();
    var cumulatedRoundScores = roundScores.map((val, idx) =>
      roundScores.slice(0, idx + 1).sum()
    );
    var cumulatedMoveScores = moveScores.map((val, idx) =>
      moveScores.slice(0, idx + 1).sum()
    );
    return {
      result: result,
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            x: cumulatedRoundScores.map((val, idx) => idx + 1),
            y: cumulatedRoundScores,
            stackgroup: 'one',
            name: 'Round score',
          },
          {
            x: cumulatedMoveScores.map((val, idx) => idx + 1),
            y: cumulatedMoveScores,
            name: 'Move score',
            stackgroup: 'one',
          },
        ],
        graphLayout: {
          yaxis: { title: 'Total score' },
          xaxis: { title: 'Round', automargin: true },
        },
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var rounds = splitIntoLines(input);
    var scores = rounds.map(round2Score);
    var roundScores = scores.map((x) => x[0]);
    var moveScores = scores.map((x) => x[1]);
    var result = roundScores.sum() + moveScores.sum();
    var cumulatedRoundScores = roundScores.map((val, idx) =>
      roundScores.slice(0, idx + 1).sum()
    );
    var cumulatedMoveScores = moveScores.map((val, idx) =>
      moveScores.slice(0, idx + 1).sum()
    );
    return {
      result: result,
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            x: cumulatedRoundScores.map((val, idx) => idx + 1),
            y: cumulatedRoundScores,
            stackgroup: 'one',
            name: 'Round score',
          },
          {
            x: cumulatedMoveScores.map((val, idx) => idx + 1),
            y: cumulatedMoveScores,
            name: 'Move score',
            stackgroup: 'one',
          },
        ],
        graphLayout: {
          yaxis: { title: 'Total score' },
          xaxis: { title: 'Round', automargin: true },
        },
      },
    };
  }
}
