import { Injectable } from '@angular/core';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import { ISolutionService } from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { parseIntoNumbers } from '../helper/util-functions/parse-into-numbers';

@Injectable({
  providedIn: 'root'
})
export class Day1Service extends BaseSolutionService implements ISolutionService {
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2021, 1, 'Sonar Sweep');
  }
  override solvePart1(input: string): string | number {
    var measurements = parseIntoNumbers(input);
    var increases = 0;
    for (let i = 1; i < measurements.length; i++) {
      increases += measurements[i-1] < measurements[i] ? 1 : 0;
    }
    return increases;
  }
  override solvePart2(input: string): string | number{
    var measurements = parseIntoNumbers(input);
    var increases = 0;
    for (let i = 3; i < measurements.length; i++) {
      const window1 = measurements[i-3] + measurements[i-2] + measurements[i-1];
      const window2 = measurements[i-2] + measurements[i-1] + measurements[i];
      increases += window1 < window2 ? 1 : 0;
    }
    return increases;
  }
}
