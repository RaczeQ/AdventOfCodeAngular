import { Injectable } from '@angular/core';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import { ISolutionService } from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';

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

  override solvePart1(input: string): string | number {
    var lines = splitIntoLines(input);
    var numbers = lines[0].split(',').map(Number);
    var boards = this.getBoards(lines);
    var wonBoard: [number, boolean][][] | null = null;
    var currentIndex = 0;
    while (wonBoard == null && currentIndex < numbers.length) {
      boards.forEach((board) => {
        this.checkNumber(board, numbers[currentIndex]);
        if (this.isWon(board)) {
          wonBoard = board;
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
    return result;
  }
  override solvePart2(input: string): string | number {
    var lines = splitIntoLines(input);
    var numbers = lines[0].split(',').map(Number);
    var boards = this.getBoards(lines);
    var wonBoards: [number, boolean][][][] = [];
    var wonNumbers: number[] = [];
    var currentIndex = 0;
    while (currentIndex < numbers.length) {
      boards.forEach((board) => {
        this.checkNumber(board, numbers[currentIndex]);
        if (this.isWon(board)) {
          wonBoards.push(board);
          wonNumbers.push(numbers[currentIndex]);
        }
      });
      boards = boards.filter((b) => !this.isWon(b));
      currentIndex++;
    }
    var leftSum = (wonBoards[wonBoards.length - 1] as unknown as [number, boolean][][])
      .flat(1)
      .filter((x) => !x[1])
      .map((x) => x[0])
      .reduce((pv, cv, idx, arr) => pv + cv);
    var result = leftSum * wonNumbers[wonNumbers.length - 1];
    return result;
  }
}
