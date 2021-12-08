import { Injectable } from '@angular/core';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import { ISolutionService, PuzzleResult } from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';
import { BingoVisualizerComponent } from './components/bingo-visualizer/bingo-visualizer.component';

@Injectable({
  providedIn: 'root',
})
export class Day4Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2021, 4, 'Giant Squid');
  }

  private getBoards(
    lines: string[],
    bingoSize: number = 5
  ): [number, boolean][][][] {
    var boards: [number, boolean][][][] = [];
    var currentLine = 2;
    while (lines.length >= currentLine + bingoSize) {
      var board: [number, boolean][][] = [];
      for (let i = 0; i < bingoSize; i++) {
        var rowNumbers = lines[currentLine + i]
          .split(' ')
          .filter((c) => c)
          .map(Number);
        board.push(rowNumbers.map((n) => [n, false]));
      }
      boards.push(board);
      currentLine += bingoSize + 1;
    }
    return boards;
  }

  private isWon(board: [number, boolean][][]): boolean {
    for (let i = 0; i < board.length; i++) {
      if (board[i].every((tuple) => tuple[1])) {
        return true;
      }
      if (board.map((row) => row[i]).every((tuple) => tuple[1])) {
        return true;
      }
    }
    return false;
  }

  private checkNumber(board: [number, boolean][][], number: number) {
    board.forEach((row) =>
      row.forEach((cell) => {
        if (cell[0] == number) {
          cell[1] = true;
        }
      })
    );
  }

  override solvePart1(input: string): PuzzleResult {
    var lines = splitIntoLines(input);
    var numbers = lines[0].split(',').map(Number);
    var boards = this.getBoards(lines);
    var wonBoard: [number, boolean][][] | null = null;
    var wonBoardIdx: number = -1;
    var lastWonIndex = 0;
    var currentIndex = 0;
    while (wonBoard == null && currentIndex < numbers.length) {
      boards.forEach((board, idx) => {
        this.checkNumber(board, numbers[currentIndex]);
        if (this.isWon(board)) {
          wonBoard = board;
          wonBoardIdx = idx;
          lastWonIndex = currentIndex;
        }
      });
      currentIndex++;
    }
    var leftSum = (wonBoard as unknown as [number, boolean][][])
      .flat(1)
      .filter((x) => !x[1])
      .map((x) => x[0])
      .reduce((pv, cv, idx, arr) => pv + cv);
    var result = leftSum * numbers[currentIndex - 1];
    // return result;
    return {
      result: result,
      component: BingoVisualizerComponent,
      componentData: {
        boards: boards,
        wonBoards: [wonBoardIdx],
        numbers: numbers.slice(0, lastWonIndex + 1)
      }
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var lines = splitIntoLines(input);
    var numbers = lines[0].split(',').map(Number);
    var baseBoards = this.getBoards(lines);
    var boards = baseBoards.map((b,i) => [b,i] as [[number, boolean][][], number]);
    var wonBoards: [number, boolean][][][] = [];
    var wonBoardsIdxs: number[] = [];
    var wonNumbers: number[] = [];
    var currentIndex = 0;
    var lastWonIndex = 0;
    while (currentIndex < numbers.length) {
      boards.forEach(([board, idx]) => {
        this.checkNumber(board, numbers[currentIndex]);
        if (this.isWon(board)) {
          wonBoards.push(board);
          wonBoardsIdxs.push(idx);
          wonNumbers.push(numbers[currentIndex]);
          lastWonIndex = currentIndex;
        }
      });
      boards = boards.filter(([b,i]) => !this.isWon(b));
      currentIndex++;
    }
    var leftSum = (wonBoards[wonBoards.length - 1] as unknown as [number, boolean][][])
      .flat(1)
      .filter((x) => !x[1])
      .map((x) => x[0])
      .reduce((pv, cv, idx, arr) => pv + cv);
    var result = leftSum * wonNumbers[wonNumbers.length - 1];
    return {
      result: result,
      component: BingoVisualizerComponent,
      componentData: {
        boards: baseBoards,
        wonBoards: [wonBoardsIdxs[wonBoardsIdxs.length - 1]],
        numbers: numbers.slice(0, lastWonIndex + 1)
      }
    };
  }
}
