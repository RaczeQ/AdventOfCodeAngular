import { Clipboard } from '@angular/cdk/clipboard';
import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { ISolutionService } from '../../services/isolution.service';
import { AvailableSolutions, SolutionsCollectorService } from '../../services/solutions-collector.service';

@Component({
  selector: 'aoc-solution',
  templateUrl: './solution.component.html',
  styleUrls: ['./solution.component.scss'],
})
export class SolutionComponent {
  availableSolutions: AvailableSolutions = {};
  year!: number;
  day!: number;
  puzzleInput: string = '';
  result1: string | number = '';
  result1Time: number = 0;
  result2: string | number = '';
  result2Time: number = 0;
  constructor(
    private solutionsCollectorService: SolutionsCollectorService,
    private route: ActivatedRoute,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar
  ) {
    this.year = route.snapshot.params["year"];
    this.day = route.snapshot.params["day"];
    solutionsCollectorService
      .getAvailableSolutionsObservable()
      .subscribe((solutions) => (this.availableSolutions = solutions));
  }

  get title(): string {
    return this.availableSolutions[this.year][this.day][0];
  }

  get service(): ISolutionService {
    return this.availableSolutions[this.year][this.day][1];
  }

  runPuzzle(): void {
    setTimeout(() => {
      var startTime = performance.now();
      this.result1 = this.service.solvePart1(this.puzzleInput);
      var endTime = performance.now();
      this.result1Time = endTime - startTime;
    })
    setTimeout(() => {
      var startTime = performance.now();
      this.result2 = this.service.solvePart2(this.puzzleInput);
      var endTime = performance.now();
      this.result2Time = endTime - startTime;
    })
  }

  copyResult1(): void {
    this.clipboard.copy(this.result1.toString());
    this.snackBar.open('Copied result for part 1 to clipboard', undefined, {
      duration: 1000
    });
  }

  copyResult2(): void {
    this.clipboard.copy(this.result2.toString());
    this.snackBar.open('Copied result for part 2 to clipboard', undefined, {
      duration: 1000
    });
  }
}
