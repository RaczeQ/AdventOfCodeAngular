import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { BaseResultComponent } from 'src/app/helper/components/base-result.component';

@Component({
  selector: 'aoc-sea-cucumbers-visualizer',
  templateUrl: './sea-cucumbers-visualizer.component.html',
  styleUrls: ['./sea-cucumbers-visualizer.component.scss'],
})
export class SeaCucumbersVisualizerComponent
  extends BaseResultComponent
  implements OnInit, AfterViewInit
{
  areas: string[][][] = [];
  currentIdx: number = 0;
  visualizing: boolean = false;
  squareWidth: number = 5;

  constructor(private el: ElementRef) {
    super();
  }

  get area(): string[][] {
    return this.areas[this.currentIdx];
  }

  get imageWidth(): number {
    return this.area.length;
  }

  get imageCanvas(): string {
    var imageArray = this.area;

    var canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    const magnifier = this.squareWidth;
    canvas.width = magnifier * this.imageWidth;
    canvas.height = magnifier * this.imageWidth;
    ctx!.fillStyle = '#fad02c';
    imageArray.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val == '>' || val == 'v') {
          ctx!.fillStyle = val == '>' ? '#fad02c' : '#ffffff';
          ctx!.fillRect(x * magnifier, y * magnifier, magnifier, magnifier);
        }
      });
    });
    const data = canvas.toDataURL();
    return data;
  }

  ngOnInit(): void {
    this.areas = this.data.areas as string[][][];
    this.currentIdx = 0;
  }

  ngAfterViewInit(): void {
    this.squareWidth =
      this.el.nativeElement.offsetWidth / (3 * this.imageWidth);
  }

  startVisualization() {
    this.visualizing = true;
    this.currentIdx = 0;
    this.loop();
  }

  private loop() {
    setTimeout(() => {
      this.currentIdx++;
      if (this.currentIdx < this.areas.length - 1) {
        this.loop();
      } else {
        this.visualizing = false;
      }
    }, 100);
  }
}
