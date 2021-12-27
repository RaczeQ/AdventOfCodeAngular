import { Component, OnInit } from '@angular/core';
import { BaseResultComponent } from 'src/app/helper/components/base-result.component';

@Component({
  selector: 'aoc-ocean-trench-visualizer',
  templateUrl: './ocean-trench-visualizer.component.html',
  styleUrls: ['./ocean-trench-visualizer.component.scss'],
})
export class OceanTrenchVisualizerComponent
  extends BaseResultComponent
  implements OnInit
{
  images: number[][][] = [];
  currentIdx: number = 0;
  visualizing: boolean = false;

  get image(): number[][] {
    return this.images[this.currentIdx];
  }

  get litPixels(): number {
    return this.image.flat().filter((d) => d == 1).length;
  }

  get imageWidth(): number {
    return this.image.length;
  }

  get finalWidth(): number {
    return this.images.slice(-1)[0].length;
  }

  get imageCanvas(): string {
    var imageArray = this.image;

    var canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    const magnifier = 5;
    canvas.width = magnifier * this.imageWidth;
    canvas.height = magnifier * this.imageWidth;
    ctx!.fillStyle = '#fad02c';
    imageArray.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val) {
          ctx!.fillRect(
            (x + 1) * magnifier,
            (y + 1) * magnifier,
            magnifier,
            magnifier
          );
        }
      });
    });
    const data = canvas.toDataURL();
    return data;
  }

  ngOnInit(): void {
    this.images = this.data.images as number[][][];
    this.currentIdx = this.images.length - 1;
    this.currentIdx = 0;
  }

  startVisualization() {
    this.visualizing = true;
    this.currentIdx = 0;
    this.loop();
  }

  private loop() {
    setTimeout(() => {
      this.currentIdx++;
      if (this.currentIdx < this.images.length - 1) {
        this.loop();
      } else {
        this.visualizing = false;
      }
    }, 100);
  }
}
