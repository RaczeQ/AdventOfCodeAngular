import { Injectable } from '@angular/core';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import { ISolutionService } from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';

@Injectable({
  providedIn: 'root',
})
export class Day3Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2021, 3, 'Binary Diagnostic');
  }
  override solvePart1(input: string): string | number {
    var lines = splitIntoLines(input);
    var columns = lines[0].length;
    var zeros = Array(columns).fill(0);
    var ones = Array(columns).fill(0);

    lines.forEach((line) => {
      [...line].forEach((char, idx) => {
        char == '0' ? zeros[idx]++ : ones[idx]++;
      });
    });

    var gammaBinary = '';
    var epsilonBinary = '';
    for (let i = 0; i < columns; i++) {
      gammaBinary += Number(zeros[i] < ones[i]);
      epsilonBinary += Number(zeros[i] > ones[i]);
    }
    var gamma = parseInt(gammaBinary, 2);
    var epsilon = parseInt(epsilonBinary, 2);

    return gamma * epsilon;
  }
  override solvePart2(input: string): string | number {
    var lines = splitIntoLines(input);
    var columns = lines[0].length;
    var oxygenLines = lines.map((l) => l);
    var carbonLines = lines.map((l) => l);
    var oxygenLine: string = '';
    var carbonLine: string = '';
    for (let i = 0; i < columns; i++) {
      if (oxygenLine.length == 0) {
        var oxygenOnes = oxygenLines.filter((l) => Number(l[i] == '1')).length;
        var oxygenZeros = oxygenLines.filter((l) => Number(l[i] == '0')).length;

        var oxygenLines = oxygenLines.filter(
          (l) => l[i] == Number(oxygenZeros <= oxygenOnes).toString()
        );
        if (oxygenLines.length == 1) {
          oxygenLine = oxygenLines[0];
        }
      }

      if (carbonLine.length == 0) {
        var carbonOnes = carbonLines.filter((l) => Number(l[i] == '1')).length;
        var carbonZeros = carbonLines.filter((l) => Number(l[i] == '0')).length;
        var carbonLines = carbonLines.filter(
          (l) => l[i] == Number(carbonZeros > carbonOnes).toString()
        );
        if (carbonLines.length == 1) {
          carbonLine = carbonLines[0];
        }
      }
    }
    var oxygenValue = parseInt(oxygenLine, 2);
    var carbonValue = parseInt(carbonLine, 2);
    return oxygenValue * carbonValue;
  }
}
