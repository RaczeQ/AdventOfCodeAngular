import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'aoc-animator',
  templateUrl: './animator.component.html',
  styleUrls: ['./animator.component.scss'],
})
export class AnimatorComponent {
  currentIdx: number = 0;
  visualizing: boolean = false;
  interval = 100;
  @Input() iterations: number = 0;
  @Output() currentIdxEvent = new EventEmitter<number>();

  resetVisualization() {
    this.currentIdx = 0;
    this.currentIdxEvent.emit(this.currentIdx);
  }

  goToEnd() {
    this.currentIdx = this.iterations - 1;
    this.currentIdxEvent.emit(this.currentIdx);
  }

  pauseVisualization() {
    this.visualizing = false;
  }

  startVisualization() {
    this.visualizing = true;
    if (this.currentIdx == this.iterations - 1) {
      this.resetVisualization();
    }
    this.loop();
  }

  nextStep() {
    this.currentIdx++;
    this.currentIdxEvent.emit(this.currentIdx);
  }

  prevStep() {
    this.currentIdx--;
    this.currentIdxEvent.emit(this.currentIdx);
  }

  private loop() {
    if (this.visualizing) {
      setTimeout(() => {
        this.nextStep();
        if (this.currentIdx < this.iterations - 1) {
          this.loop();
        } else {
          this.visualizing = false;
        }
      }, this.interval);
    }
  }
}
