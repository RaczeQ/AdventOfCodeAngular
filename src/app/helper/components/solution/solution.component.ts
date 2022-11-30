import { Clipboard } from '@angular/cdk/clipboard';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import {
  ISolutionService,
  PuzzleResult,
} from '../../services/isolution.service';
import {
  AvailableSolutions,
  SolutionsCollectorService,
} from '../../services/solutions-collector.service';
import { BaseResultComponent } from '../base-result.component';

@Component({
  selector: 'aoc-solution',
  templateUrl: './solution.component.html',
  styleUrls: ['./solution.component.scss'],
})
export class SolutionComponent implements OnInit {
  @ViewChild('viewContainerRefOne', { read: ViewContainerRef })
  viewContainerRef1!: ViewContainerRef;
  @ViewChild('viewContainerRefTwo', { read: ViewContainerRef })
  viewContainerRef2!: ViewContainerRef;
  availableSolutions: AvailableSolutions = {};
  year!: number;
  day!: number;
  puzzleInput: string = '';
  result1: string | number = '';
  result1Time: number = 0;
  result1Component: ComponentRef<BaseResultComponent> | null = null;
  result2: string | number = '';
  result2Time: number = 0;
  result2Component: ComponentRef<BaseResultComponent> | null = null;
  running: boolean = false;
  constructor(
    private solutionsCollectorService: SolutionsCollectorService,
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {
    solutionsCollectorService
      .getAvailableSolutionsObservable()
      .subscribe((solutions) => (this.availableSolutions = solutions));
  }
  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.result1 = '';
      this.result2 = '';
      if (this.result1Component != null) {
        this.result1Component.destroy();
        this.result1Component = null;
      }

      if (this.result2Component != null) {
        this.result2Component.destroy();
        this.result2Component = null;
      }
      this.puzzleInput = '';
      this.year = params['year'];
      this.day = params['day'];
      this.httpClient
        .get(`assets/inputs/${this.year}/${this.day}.txt`, {
          responseType: 'text',
        })
        .subscribe((data) => {
          if (this.puzzleInput.length == 0) {
            this.puzzleInput = data;
          }
        });
    });
  }

  get title(): string {
    return this.availableSolutions[this.year][this.day].dayName;
  }

  get service(): ISolutionService {
    return this.availableSolutions[this.year][this.day].service;
  }

  get additionalInfo(): string {
    return this.availableSolutions[this.year][this.day].additionalInfo;
  }

  get aocPuzzleUrl(): string {
    return `https://adventofcode.com/${this.year}/day/${this.day}`
  }

  get aocPuzzleInputUrl(): string {
    return `${this.aocPuzzleUrl}/input`
  }

  openPuzzlePage(): void {
    window.open(this.aocPuzzleUrl, '_blank');
  }

  runPuzzle(): void {
    this.running = true;
    var puzzle1Finished = false;
    var puzzle2Finished = false;
    this.result1 = '';
    this.result2 = '';
    if (this.result1Component != null) {
      this.result1Component.destroy();
      this.result1Component = null;
    }

    if (this.result2Component != null) {
      this.result2Component.destroy();
      this.result2Component = null;
    }
    setTimeout(() => {
      var startTime = performance.now();
      var puzzleResultPromise = this.service.solvePart1(this.puzzleInput);
      Promise.resolve(puzzleResultPromise).then((puzzleResult) => {
        var resultType = typeof puzzleResult;
        if (resultType === 'string' || resultType === 'number') {
          this.result1 = puzzleResult as string | number;
        } else {
          puzzleResult = puzzleResult as PuzzleResult;
          this.result1 = puzzleResult.result;
          const factory = this.componentFactoryResolver.resolveComponentFactory(
            puzzleResult.component
          );
          this.result1Component =
            this.viewContainerRef1.createComponent(factory);
          this.result1Component.instance.data = puzzleResult.componentData;
          this.result1Component.hostView.detectChanges();
          this.result1Component.injector.get(ChangeDetectorRef).markForCheck();
        }
        var endTime = performance.now();
        this.result1Time = endTime - startTime;
        puzzle1Finished = true;
        this.running = !puzzle1Finished || !puzzle2Finished;
      });
    });
    setTimeout(() => {
      var startTime = performance.now();
      var puzzleResultPromise = this.service.solvePart2(this.puzzleInput);
      Promise.resolve(puzzleResultPromise).then((puzzleResult) => {
        var resultType = typeof puzzleResult;
        if (resultType === 'string' || resultType === 'number') {
          this.result2 = puzzleResult as string | number;
        } else {
          puzzleResult = puzzleResult as PuzzleResult;
          this.result2 = puzzleResult.result;
          const factory = this.componentFactoryResolver.resolveComponentFactory(
            puzzleResult.component
          );
          this.result2Component =
            this.viewContainerRef2.createComponent(factory);
          this.result2Component.instance.data = puzzleResult.componentData;
          this.result2Component.hostView.detectChanges();
          this.result2Component.injector.get(ChangeDetectorRef).markForCheck();
        }
        var endTime = performance.now();
        this.result2Time = endTime - startTime;
        puzzle2Finished = true;
        this.running = !puzzle1Finished || !puzzle2Finished;
      });
    });
  }

  copyResult1(): void {
    this.clipboard.copy(this.result1.toString());
    this.snackBar.open('Copied result for part 1 to clipboard', undefined, {
      duration: 1000,
    });
  }

  copyResult2(): void {
    this.clipboard.copy(this.result2.toString());
    this.snackBar.open('Copied result for part 2 to clipboard', undefined, {
      duration: 1000,
    });
  }
}
