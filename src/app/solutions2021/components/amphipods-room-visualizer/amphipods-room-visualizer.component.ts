import { Component, HostBinding, OnInit } from '@angular/core';
import { BaseResultComponent } from 'src/app/helper/components/base-result.component';
import { Point2D } from 'src/app/helper/util-functions/point';
import { AmphipodRoomField } from '../../day23.service';

@Component({
  selector: 'aoc-amphipods-room-visualizer',
  templateUrl: './amphipods-room-visualizer.component.html',
  styleUrls: ['./amphipods-room-visualizer.component.scss'],
})
export class AmphipodsRoomVisualizerComponent
  extends BaseResultComponent
  implements OnInit
{
  states: AmphipodRoomField[][] = [];
  border: Point2D[] = [];
  costs: number[] = [];
  currentStateIdx: number = 0;
  minX: number = 0;
  maxX: number = 0;
  minY: number = 0;
  maxY: number = 0;

  @HostBinding('style.--col')
  get col(): number {
    return this.maxX - this.minX;
  }

  @HostBinding('style.--row')
  get row(): number {
    return this.maxY - this.minY;
  }

  ngOnInit(): void {
    this.states = this.data.states as AmphipodRoomField[][];
    this.border = this.data.border as Point2D[];
    this.costs = this.data.costs as number[];
    this.currentStateIdx = 0;
    this.minX = Math.min(...this.border.map((p) => p.x));
    this.maxX = Math.max(...this.border.map((p) => p.x));
    this.minY = Math.min(...this.border.map((p) => p.y));
    this.maxY = Math.max(...this.border.map((p) => p.y));
  }

  nextStep() {
    this.currentStateIdx++;
  }

  prevStep() {
    this.currentStateIdx--;
  }

  get currentState(): AmphipodRoomField[] {
    return this.states[this.currentStateIdx];
  }

  get currentCost(): number {
    return this.costs[this.currentStateIdx];
  }

  get currentMoving(): number | undefined {
    if (this.currentStateIdx == this.states.length - 1) {
      return undefined;
    }
    var currentState = this.states[this.currentStateIdx];
    var nextState = this.states[this.currentStateIdx + 1];
    var result = 0;
    currentState.forEach((f, idx) => {
      if (currentState[idx].occupant && !nextState[idx].occupant) {
        result = idx;
      }
    });
    return result;
  }
}
