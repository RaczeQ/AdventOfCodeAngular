import { Component, Input, OnInit } from '@angular/core';
import { BaseResultComponent } from 'src/app/helper/components/base-result.component';
import { SnailfishNumber } from '../../day18.service';

@Component({
  selector: 'aoc-snailfish-number-visualizer',
  templateUrl: './snailfish-number-visualizer.component.html',
  styleUrls: ['./snailfish-number-visualizer.component.scss'],
})
export class SnailfishNumberVisualizerComponent
  extends BaseResultComponent
  implements OnInit
{
  @Input() snailfish?: SnailfishNumber;
  @Input() markedSnailfish?: SnailfishNumber;
  @Input() depth: number = 0;
  snapshots: [SnailfishNumber, SnailfishNumber | undefined][][] = [];
  currentSnapshotIdx: number = 0;
  currentSnailfishIdx: number = 0;
  iterations: number = 0;
  visualizing: boolean = false;
  interval = 100;
  ngOnInit(): void {
    if (this.data) {
      this.snapshots = this.data.snapshots as [
        SnailfishNumber,
        SnailfishNumber | undefined
      ][][];
      this.currentSnapshotIdx = this.snapshots.length - 1;
      this.currentSnailfishIdx =
        this.snapshots[this.currentSnapshotIdx].length - 1;
      this.iterations = this.snapshots
        .map((a) => a.length)
        .reduce((a, b) => a + b);
    }
  }

  get currentSnailfish(): SnailfishNumber {
    return (
      this.snailfish ??
      this.snapshots[this.currentSnapshotIdx][this.currentSnailfishIdx][0]
    );
  }

  get currentMarkedSnailfish(): SnailfishNumber | undefined {
    return (
      this.markedSnailfish ??
      this.snapshots[this.currentSnapshotIdx][this.currentSnailfishIdx][1]
    );
  }

  get isMarked(): boolean {
    var currentSnailfish = this.currentSnailfish;
    var markedSnailfish = this.markedSnailfish;
    return (
      markedSnailfish !== undefined &&
      ((currentSnailfish.x == markedSnailfish?.x &&
        currentSnailfish.xPosition == markedSnailfish?.xPosition) ||
        (currentSnailfish.y == currentSnailfish?.y &&
          currentSnailfish.yPosition == markedSnailfish?.yPosition))
    );
  }

  asSnailfish(n: SnailfishNumber | number): SnailfishNumber {
    return n as SnailfishNumber;
  }

  isNumber(n: SnailfishNumber | number): boolean {
    return typeof n == 'number';
  }

  pauseVisualization() {
    this.visualizing = false;
  }

  startVisualization() {
    this.visualizing = true;
    if (
      this.currentSnailfishIdx ==
        this.snapshots[this.currentSnapshotIdx].length - 1 &&
      this.currentSnapshotIdx == this.snapshots.length - 1
    ) {
      this.currentSnailfishIdx = 0;
      this.currentSnapshotIdx = 0;
      this.iterations = 0;
    }
    this.loop();
  }

  nextStep() {
    this.iterations++;
    if (
      this.currentSnailfishIdx ==
      this.snapshots[this.currentSnapshotIdx].length - 1
    ) {
      this.currentSnapshotIdx++;
      this.currentSnailfishIdx = 0;
    } else {
      this.currentSnailfishIdx++;
    }
  }

  prevStep() {
    this.iterations--;
    if (this.currentSnailfishIdx == 0) {
      this.currentSnapshotIdx--;
      this.currentSnailfishIdx =
        this.snapshots[this.currentSnapshotIdx].length - 1;
    } else {
      this.currentSnailfishIdx--;
    }
  }

  private loop() {
    if (this.visualizing) {
      setTimeout(() => {
        this.nextStep();
        if (
          this.currentSnailfishIdx <
            this.snapshots[this.currentSnapshotIdx].length - 1 ||
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
