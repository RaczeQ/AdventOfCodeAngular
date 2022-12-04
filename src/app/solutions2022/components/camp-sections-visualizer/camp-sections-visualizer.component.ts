import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { min } from 'rxjs';
import { BaseResultComponent } from 'src/app/helper/components/base-result.component';

@Component({
  selector: 'aoc-camp-sections-visualizer',
  templateUrl: './camp-sections-visualizer.component.html',
  styleUrls: ['./camp-sections-visualizer.component.scss'],
})
export class CampSectionsVisualizerComponent
  extends BaseResultComponent
  implements OnInit, AfterViewInit
{
  sections: [number[], number[]][] = [];
  squareWidth: number = 5;
  minSection: number = 0;
  maxSection: number = 0;

  constructor(private el: ElementRef) {
    super();
  }

  get imageWidth(): number {
    return this.maxSection - this.minSection + 1;
  }

  get imageCanvas(): string {
    var sections = this.sections;

    var canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    const magnifier = this.squareWidth;
    canvas.width = magnifier * this.imageWidth;
    canvas.height = magnifier * this.sections.length;
    sections.forEach((ranges, y) => {
      Array.range(this.minSection, this.maxSection + 1).forEach(
        (sectionId, x) => {
          var fillStyle = null;
          if (ranges.every((range) => range.includes(sectionId))) {
            fillStyle = '#fad02c';
            ctx!.globalAlpha = 1.0;
          } else if (ranges[0].includes(sectionId)) {
            fillStyle = '#fad02c';
            ctx!.globalAlpha = 0.6;
          } else if (ranges[1].includes(sectionId)) {
            fillStyle = '#ffffff';
            ctx!.globalAlpha = 0.6;
          }

          if (fillStyle != null) {
            ctx!.fillStyle = fillStyle;
            ctx!.fillRect(x * magnifier, y * magnifier, magnifier, magnifier);
          }
        }
      );
    });
    const data = canvas.toDataURL();
    return data;
  }

  ngOnInit(): void {
    this.sections = this.data.sections as [number[], number[]][];
    var allNumbers: number[] = [];
    this.sections.forEach((ranges) => {
      allNumbers = allNumbers.concat(ranges.flat());
    });
    this.minSection = Math.min(...allNumbers);
    this.maxSection = Math.max(...allNumbers);
  }

  ngAfterViewInit(): void {
    this.squareWidth =
      this.el.nativeElement.offsetWidth / (2 * this.imageWidth);
  }
}
