import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { Point2D } from 'src/app/helper/util-functions/point';
import { BaseResultComponent } from '../../../helper/components/base-result.component';

@Component({
  selector: 'aoc-falling-sand-visualizer',
  templateUrl: './falling-sand-visualizer.component.html',
  styleUrls: ['./falling-sand-visualizer.component.scss'],
})
export class FallingSandVisualizerComponent
  extends BaseResultComponent
  implements OnInit, AfterViewInit
{
  rocks!: Point2D[];
  sands!: Point2D[][];
  minX!: number;
  maxX!: number;
  minY!: number;
  maxY!: number;
  currentIdx: number = 0;
  visualizing: boolean = false;
  squareWidth: number = 5;

  constructor(private el: ElementRef) {
    super();
  }

  get sand(): Point2D[] {
    return this.sands[this.currentIdx];
  }

  get imageHeight(): number {
    return this.maxY - this.minY + 1;
  }

  get imageWidth(): number {
    return this.maxX - this.minX + 1;
  }

  get rockCanvas(): string {
    var canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    const magnifier = this.squareWidth;
    canvas.width = magnifier * this.imageWidth;
    canvas.height = magnifier * this.imageHeight;
    ctx!.fillStyle = '#ffffff';
    this.rocks.forEach((rock) => {
      ctx!.fillRect(
        (rock.x - this.minX) * magnifier,
        (rock.y - this.minY) * magnifier,
        magnifier,
        magnifier
      );
    });
    const data = canvas.toDataURL();
    return data;
  }

  get imageCanvas(): string {
    var canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    const magnifier = this.squareWidth;
    canvas.width = magnifier * this.imageWidth;
    canvas.height = magnifier * this.imageHeight;
    ctx!.fillStyle = '#fad02c';
    this.sand.forEach((grain) => {
      ctx!.fillRect(
        (grain.x - this.minX) * magnifier,
        (grain.y - this.minY) * magnifier,
        magnifier,
        magnifier
      );
    });
    const data = canvas.toDataURL();
    return data;
  }

  ngOnInit(): void {
    this.rocks = this.data.rocks as Point2D[];
    this.sands = this.data.sands as Point2D[][];
    this.currentIdx = 0;
    this.minX = Math.min(
      ...this.rocks.concat(this.sands[this.sands.length - 1]).map((p) => p.x)
    );
    this.maxX = Math.max(
      ...this.rocks.concat(this.sands[this.sands.length - 1]).map((p) => p.x)
    );
    this.minY = 0;
    this.maxY = Math.max(
      ...this.rocks.concat(this.sands[this.sands.length - 1]).map((p) => p.y)
    );
  }

  ngAfterViewInit(): void {
    this.squareWidth =
      this.el.nativeElement.offsetWidth / (3 * this.imageWidth);
  }
}
