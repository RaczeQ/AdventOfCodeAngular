import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { BaseResultComponent } from 'src/app/helper/components/base-result.component';
import { Point2D } from 'src/app/helper/util-functions/point';
import { RopeMove } from '../../day9.service';

@Component({
  selector: 'aoc-rope-bridge-visualizer',
  templateUrl: './rope-bridge-visualizer.component.html',
  styleUrls: ['./rope-bridge-visualizer.component.scss'],
})
export class RopeBridgeVisualizerComponent
  extends BaseResultComponent
  implements OnInit, AfterViewInit
{
  currentIdx: number = 0;
  visualizing: boolean = false;
  interval = 100;

  headMoves!: { move: RopeMove; position: Point2D }[];
  knotsMoves!: Point2D[][];
  minX!: number;
  maxX!: number;
  minY!: number;
  maxY!: number;

  squareWidth: number = 5;

  get move(): RopeMove {
    return this.headMoves[this.currentIdx].move;
  }

  get head(): Point2D {
    return this.headMoves[this.currentIdx].position;
  }

  get tail(): Point2D {
    return this.knotsMoves.slice(-1)[0][this.currentIdx];
  }

  get tailTrail(): Point2D[] {
    return this.knotsMoves.slice(-1)[0].slice(0, this.currentIdx + 1);
  }

  get body(): Point2D[] {
    return this.knotsMoves
      .slice(0, -1)
      .map((knotMoves) => knotMoves[this.currentIdx]);
  }

  get gridRepeatStyle(): object {
    return {
      'grid-template-columns': `repeat(${this.minX + this.maxX + 1}, ${
        this.squareWidth
      }px)`,
      'grid-template-rows': `repeat(${this.minY + this.maxY + 1}, ${
        this.squareWidth
      }px)`,
    };
  }

  constructor(private el: ElementRef) {
    super();
  }

  ngOnInit(): void {
    this.headMoves = this.data.headMoves as {
      move: RopeMove;
      position: Point2D;
    }[];
    this.knotsMoves = this.data.knotsMoves as Point2D[][];

    this.minX = -1 * Math.min(...this.headMoves.map((m) => m.position.x));
    this.maxX = Math.max(...this.headMoves.map((m) => m.position.x));
    this.minY = -1 * Math.min(...this.headMoves.map((m) => m.position.y));
    this.maxY = Math.max(...this.headMoves.map((m) => m.position.y));
  }

  ngAfterViewInit(): void {
    this.squareWidth =
      this.el.nativeElement.offsetWidth / ((this.minX + this.maxX + 1) * 2);
  }

  resetVisualization() {
    this.currentIdx = 0;
  }

  goToEnd() {
    this.currentIdx = this.headMoves.length - 1;
  }

  pauseVisualization() {
    this.visualizing = false;
  }

  startVisualization() {
    this.visualizing = true;
    if (this.currentIdx == this.headMoves.length - 1) {
      this.resetVisualization();
    }
    this.loop();
  }

  nextStep() {
    this.currentIdx++;
  }

  prevStep() {
    this.currentIdx--;
  }

  private loop() {
    if (this.visualizing) {
      setTimeout(() => {
        this.nextStep();
        if (this.currentIdx < this.headMoves.length - 1) {
          this.loop();
        } else {
          this.visualizing = false;
        }
      }, this.interval);
    }
  }
}
