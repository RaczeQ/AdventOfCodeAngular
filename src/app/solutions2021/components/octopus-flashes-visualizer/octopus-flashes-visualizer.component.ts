import { Component, OnInit } from '@angular/core';
import { BaseResultComponent } from 'src/app/helper/components/base-result.component';

@Component({
  selector: 'aoc-octopus-flashes-visualizer',
  templateUrl: './octopus-flashes-visualizer.component.html',
  styleUrls: ['./octopus-flashes-visualizer.component.scss'],
})
export class OctopusFlashesVisualizerComponent
  extends BaseResultComponent
  implements OnInit
{
  snapshots: number[][][] = [];
  flashes: number[] = [];
  currentIdx: number = 0;
  visualizing: boolean = false;

  get snapshot(): number[][] {
    return this.snapshots[this.currentIdx];
  }

  get flashedAmount(): number {
    return this.currentIdx > 0
      ? this.flashes.slice(0, this.currentIdx).reduce((a, b) => a + b)
      : this.flashes[0];
  }

  ngOnInit(): void {
    this.snapshots = this.data.snapshots as number[][][];
    this.flashes = this.data.flashes as number[];
    this.currentIdx = this.snapshots.length - 1;
  }

  startVisualization() {
    this.visualizing = true;
    this.currentIdx = 0;
    this.loop();
  }

  private loop() {
    setTimeout(() => {
      this.currentIdx++;
      if (this.currentIdx < this.snapshots.length - 1) {
        this.loop();
      } else {
        this.visualizing = false;
      }
    }, 100);
  }
}
