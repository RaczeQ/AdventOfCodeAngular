import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { BaseResultComponent } from 'src/app/helper/components/base-result.component';
import { Point2D } from 'src/app/helper/util-functions/point';
import { Blizzard, getCurrentBlizzardsPositions } from '../../day24.service';

@Component({
  selector: 'aoc-blizzard-visualizer',
  templateUrl: './blizzard-visualizer.component.html',
  styleUrls: ['./blizzard-visualizer.component.scss'],
})
export class BlizzardVisualizerComponent
  extends BaseResultComponent
  implements OnInit, AfterViewInit
{
  blizzards!: Blizzard[];
  moves!: Point2D[];
  walls!: Point2D[];
  minX!: number;
  maxX!: number;
  minY!: number;
  maxY!: number;
  currentIdx: number = 0;
  visualizing: boolean = false;
  squareWidth: number = 5;
  blizzardsCache = {};

  constructor(private el: ElementRef) {
    super();
  }

  get imageHeight(): number {
    return this.maxY - this.minY + 1;
  }

  get imageWidth(): number {
    return this.maxX - this.minX + 1;
  }

  get wallsCanvas(): string {
    var canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    const magnifier = this.squareWidth;
    canvas.width = magnifier * this.imageWidth;
    canvas.height = magnifier * this.imageHeight;
    ctx!.fillStyle = '#ccc';
    this.walls.forEach((wall) => {
      ctx!.fillRect(
        (wall.x - this.minX) * magnifier,
        (wall.y - this.minY) * magnifier,
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

    ctx!.fillStyle = 'rgb(250, 208, 44)';
    ctx!.fillRect(
      (this.moves[this.currentIdx].x - this.minX) * magnifier,
      (this.moves[this.currentIdx].y - this.minY) * magnifier,
      magnifier,
      magnifier
    );
    ctx!.fillStyle = 'rgba(115,155,208,0.25)';
    var currentBlizzard = getCurrentBlizzardsPositions(
      this.blizzards,
      this.currentIdx,
      this.maxX - 1,
      this.maxY - 1,
      this.blizzardsCache
    );
    currentBlizzard.forEach((blizzard) => {
      ctx!.fillRect(
        (blizzard.x - this.minX) * magnifier,
        (blizzard.y - this.minY) * magnifier,
        magnifier,
        magnifier
      );
    });
    const data = canvas.toDataURL();
    return data;
  }

  ngOnInit(): void {
    this.blizzards = this.data.blizzards as Blizzard[];
    this.walls = this.data.walls as Point2D[];
    this.moves = this.data.moves as Point2D[];
    this.currentIdx = 0;
    this.minX = Math.min(...this.walls.map((p) => p.x));
    this.maxX = Math.max(...this.walls.map((p) => p.x));
    this.minY = Math.min(...this.walls.map((p) => p.y));
    this.maxY = Math.max(...this.walls.map((p) => p.y));
  }

  ngAfterViewInit(): void {
    this.blizzardsCache = {};
    this.squareWidth = this.el.nativeElement.offsetHeight / this.imageHeight;
  }
}
