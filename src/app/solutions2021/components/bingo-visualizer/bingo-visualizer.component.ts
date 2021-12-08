import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BaseResultComponent } from 'src/app/helper/components/base-result.component';

export function normalize(
  val: number,
  in_min: number,
  in_max: number,
  out_min: number,
  out_max: number
) {
  return ((val - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}

@Component({
  selector: 'aoc-bingo-visualizer',
  templateUrl: './bingo-visualizer.component.html',
  styleUrls: ['./bingo-visualizer.component.scss'],
})
export class BingoVisualizerComponent
  extends BaseResultComponent
  implements OnInit
{
  boards!: number[][][];
  numbers!: number[];
  visualizeCounter: number = 0;
  wonBoards!: number[];
  visualizing: boolean = false;
  constructor(private sanitizer: DomSanitizer) {
    super();
  }
  ngOnInit(): void {
    var fullBoards = this.data.boards as [number, boolean][][][];
    this.boards = fullBoards.map((board) =>
      board.map((row) => row.map((tuple) => tuple[0]))
    );
    this.numbers = this.data.numbers as number[];
    this.visualizeCounter = this.numbers.length;
    this.wonBoards = this.data.wonBoards;
  }

  getNumberStyle(n: number): string {
    var idx = this.numbers.slice(0, this.visualizeCounter).findIndex(num => num == n);
    if (idx >= 0) {
      var value = normalize(idx, 0, this.numbers.length, 0.25, 1);
      return `rgba(250, 208, 44, ${value})`;
    }
    return 'transparent';
  }
  startVisualization() {
    this.visualizing = true;
    this.visualizeCounter = 0;
    this.loop();
  }

  private loop() {
    setTimeout(() => {
      this.visualizeCounter++;
      if (this.visualizeCounter < this.numbers.length) {
        this.loop();
      } else {
        this.visualizing = false;
      }
    }, 100);
  }
}
