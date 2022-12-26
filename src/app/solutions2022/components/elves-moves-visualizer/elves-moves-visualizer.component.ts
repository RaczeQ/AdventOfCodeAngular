import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { colorInterpolate } from 'src/app/helper/util-functions/color-interpolate';
import { normalize } from 'src/app/helper/util-functions/normalize';
import { BaseResultComponent } from '../../../helper/components/base-result.component';
import { MovingElf } from '../../day23.service';

@Component({
  selector: 'aoc-elves-moves-visualizer',
  templateUrl: './elves-moves-visualizer.component.html',
  styleUrls: ['./elves-moves-visualizer.component.scss'],
})
export class ElvesMovesVisualizerComponent
  extends BaseResultComponent
  implements OnInit, AfterViewInit
{
  elves!: MovingElf[];
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

  get imageHeight(): number {
    return this.maxY - this.minY + 1;
  }

  get imageWidth(): number {
    return this.maxX - this.minX + 1;
  }

  get imageCanvas(): string {
    var canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    const magnifier = this.squareWidth;
    canvas.width = magnifier * this.imageWidth;
    canvas.height = magnifier * this.imageHeight;

    ctx!.fillStyle = 'rgb(250, 208, 44)';
    this.elves.forEach((elf) => {
      ctx!.fillStyle = colorInterpolate(
        'rgb(250, 208, 44)',
        'rgb(255, 255, 255)',
        normalize(
          this.currentIdx -
            1 -
            elf.moveChanges.findLast((change) => change < this.currentIdx)!,
          0,
          10,
          0,
          1
        )
      );
      ctx!.fillRect(
        (elf.positionsList[this.currentIdx].x - this.minX) * magnifier,
        (elf.positionsList[this.currentIdx].y - this.minY) * magnifier,
        magnifier,
        magnifier
      );
    });
    const data = canvas.toDataURL();
    return data;
  }

  ngOnInit(): void {
    this.elves = this.data.elves as MovingElf[];
    this.currentIdx = 0;
    this.minX = Math.min(
      ...this.elves.map((elf) => Math.min(...elf.positionsList.map((p) => p.x)))
    );
    this.maxX = Math.max(
      ...this.elves.map((elf) => Math.max(...elf.positionsList.map((p) => p.x)))
    );
    this.minY = Math.min(
      ...this.elves.map((elf) => Math.min(...elf.positionsList.map((p) => p.y)))
    );
    this.maxY = Math.max(
      ...this.elves.map((elf) => Math.max(...elf.positionsList.map((p) => p.y)))
    );
  }

  ngAfterViewInit(): void {
    this.squareWidth =
      this.el.nativeElement.offsetWidth / (3 * this.imageWidth);
  }
}
