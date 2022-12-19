import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { BaseResultComponent } from '../../../helper/components/base-result.component';
import { RockPosition } from '../../day17.service';

const TABLEAU_10_MEDIUM_COLORMAP: string[] = [
  'rgb(114, 158, 206)',
  'rgb(255, 158,  74)',
  'rgb(103, 191,  92)',
  'rgb(237, 102,  93)',
  'rgb(173, 139, 201)',
  'rgb(168, 120, 110)',
  'rgb(237, 151, 202)',
  'rgb(162, 162, 162)',
  'rgb(205, 204,  93)',
  'rgb(109, 204, 218)',
];

@Component({
  selector: 'aoc-falling-rocks-visualizer',
  templateUrl: './falling-rocks-visualizer.component.html',
  styleUrls: ['./falling-rocks-visualizer.component.scss'],
})
export class FallingRocksVisualizerComponent
  extends BaseResultComponent
  implements OnInit, AfterViewInit
{
  rocksPositions!: RockPosition[][];
  jets!: number[];
  minX!: number;
  maxX!: number;
  minY!: number;
  maxY!: number;
  totalIterations: number = 0;
  currentIdx: number = 0;
  currentRock: number = 0;
  currentMove: number = 0;
  visualizing: boolean = false;
  squareWidth: number = 5;
  imageWidth: number = 9;
  topRows: number = 50;

  get rocks(): RockPosition[] {
    return this.rocksPositions
      .filter((rock, id) => id <= this.currentRock)
      .flatMap((rockPositions, id) =>
        id < this.currentRock
          ? rockPositions[rockPositions.length - 1]
          : rockPositions[this.currentMove]
      );
  }

  get imageHeight(): number {
    return this.maxY - this.minY + 1;
  }

  changeIdx(newIdx: number) {
    var change = newIdx - this.currentIdx;
    if (newIdx === 0) {
      this.currentRock = 0;
      this.currentMove = 0;
    } else if (newIdx === this.totalIterations - 1) {
      this.currentRock = this.rocksPositions.length - 1;
      this.currentMove = this.rocksPositions[this.currentRock].length - 1;
    } else if (change > 0) {
      this.currentMove += 1;
      if (this.currentMove === this.rocksPositions[this.currentRock].length) {
        this.currentRock += 1;
        this.currentMove = 0;
      }
    } else {
      this.currentMove -= 1;
      if (this.currentMove < 0) {
        this.currentRock -= 1;
        this.currentMove = this.rocksPositions[this.currentRock].length - 1;
      }
    }
    this.currentIdx = newIdx;
  }

  constructor(private el: ElementRef) {
    super();
  }

  ngOnInit(): void {
    this.jets = this.data.jets as number[];
    this.rocksPositions = this.data.rocksPositions as RockPosition[][];
    this.currentIdx = 0;
    this.minX = Math.min(
      ...this.rocksPositions.flatMap((rockPositions) =>
        rockPositions.map((position) => position.position.x)
      )
    );
    this.maxX = Math.max(
      ...this.rocksPositions.flatMap((rockPositions) =>
        rockPositions.map(
          (position) => position.position.x + position.shape[0].length
        )
      )
    );
    this.minY = 0;
    this.maxY = Math.max(
      ...this.rocksPositions.flatMap((rockPositions) =>
        rockPositions.map(
          (position) => position.position.y + position.shape.length
        )
      )
    );
    this.totalIterations = this.rocksPositions
      .map((rockPositions) => rockPositions.length)
      .sum();
  }

  ngAfterViewInit(): void {
    this.squareWidth = 600 / this.topRows;
  }

  get rockCanvas(): string {
    var canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    const magnifier = this.squareWidth;
    canvas.width = magnifier * this.imageWidth;
    canvas.height = magnifier * (this.topRows + 1);

    var offsetY =
      this.rocksPositions[this.currentRock][0].position.y +
      4 -
      (this.topRows + 1);

    // plot bounds
    ctx!.fillStyle = '#ffffff';
    ctx!.fillRect(0, 0, magnifier, magnifier * (this.topRows + 1));
    ctx!.fillRect(8 * magnifier, 0, magnifier, magnifier * (this.topRows + 1));

    if (offsetY <= 0) {
      ctx!.fillRect(0, this.topRows * magnifier, magnifier * 9, magnifier);
    }

    this.rocks.forEach((rock, idx) => {
      ctx!.fillStyle =
        TABLEAU_10_MEDIUM_COLORMAP[idx % TABLEAU_10_MEDIUM_COLORMAP.length];

      rock.shape.forEach((line, shapeY) => {
        var y = shapeY + rock.position.y;
        line.forEach((value, shapeX) => {
          if (value === 1) {
            ctx!.fillRect(
              (shapeX + rock.position.x + 1) * magnifier,
              (this.topRows +
                0 -
                (shapeY + rock.position.y - Math.max(0, offsetY))) *
                magnifier,
              magnifier,
              magnifier
            );
          }
        });
        // }
      });
    });
    const data = canvas.toDataURL();
    return data;
  }
}
