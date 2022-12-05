import { AfterViewInit, Component, OnInit } from '@angular/core';
import { BaseResultComponent } from 'src/app/helper/components/base-result.component';
import { CargoMove, CargoSnapshot, CargoStep } from '../../day5.service';

@Component({
  selector: 'aoc-cargo-visualizer',
  templateUrl: './cargo-visualizer.component.html',
  styleUrls: ['./cargo-visualizer.component.scss'],
})
export class CargoVisualizerComponent
  extends BaseResultComponent
  implements OnInit, AfterViewInit
{
  snapshots: CargoSnapshot[] = [];

  currentSnapshotIdx: number = 0;
  currentStepIdx: number = 0;
  currentStepStateIdx: number = 0;
  visualizing: boolean = false;
  iterations: number = 0;
  totalIterations: number = 0;
  interval = 100;

  get snapshot(): CargoSnapshot {
    return this.snapshots[this.currentSnapshotIdx];
  }

  get move(): CargoMove {
    return this.snapshot.move;
  }

  get step(): CargoStep {
    return this.snapshot.steps[this.currentStepIdx];
  }

  ngOnInit(): void {
    this.snapshots = this.data.snapshots as CargoSnapshot[];
    this.totalIterations =
      this.snapshots.flatMap((s) => s.steps.map((x) => 3)).sum() - 1;
  }
  ngAfterViewInit(): void {}

  pauseVisualization() {
    this.visualizing = false;
  }

  startVisualization() {
    this.visualizing = true;
    if (
      this.currentStepIdx == this.snapshot.steps.length - 1 &&
      this.currentSnapshotIdx == this.snapshots.length - 1 &&
      this.currentStepStateIdx == 2
    ) {
      this.currentStepIdx = 0;
      this.currentSnapshotIdx = 0;
      this.currentStepStateIdx = 0;
      this.iterations = 0;
    }
    this.loop();
  }

  nextStep() {
    this.iterations++;
    var isLastStepState = this.currentStepStateIdx == 2;
    var isLastStep = this.currentStepIdx == this.snapshot.steps.length - 1;

    this.currentStepStateIdx++;

    if (isLastStepState) {
      this.currentStepStateIdx = 0;
      this.currentStepIdx++;
    }

    if (isLastStep && isLastStepState) {
      this.currentStepIdx = 0;
      this.currentSnapshotIdx++;
    }
  }

  prevStep() {
    this.iterations--;
    var isFirstStepState = this.currentStepStateIdx == 0;
    var isFirstStep = this.currentStepIdx == 0;

    this.currentStepStateIdx--;

    if (isFirstStepState) {
      this.currentStepIdx--;
      this.currentStepStateIdx = 2;
    }

    if (isFirstStep && isFirstStepState) {
      this.currentSnapshotIdx--;
      this.currentStepIdx = this.snapshot.steps.length - 1;
    }
  }

  private loop() {
    if (this.visualizing) {
      setTimeout(() => {
        this.nextStep();
        if (
          this.currentStepStateIdx < 2 ||
          this.currentStepIdx < this.snapshot.steps.length - 1 ||
          this.currentSnapshotIdx < this.snapshots.length - 1
        ) {
          this.loop();
        } else {
          this.visualizing = false;
        }
      }, this.interval);
    }
  }
}
