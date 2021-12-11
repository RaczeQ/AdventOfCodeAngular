import { Component, OnInit } from '@angular/core';
import { BaseResultComponent } from 'src/app/helper/components/base-result.component';
import { Display } from '../../day8.service';

@Component({
  selector: 'aoc-seven-segments-display-visualizer',
  templateUrl: './seven-segments-display-visualizer.component.html',
  styleUrls: ['./seven-segments-display-visualizer.component.scss'],
})
export class SevenSegmentsDisplayVisualizerComponent
  extends BaseResultComponent
  implements OnInit
{
  inputDisplays!: Display[];
  decodedDisplays!: Display[];
  accentUniqueLengths: boolean = false;
  uniqueLenghts = [2, 3, 4, 7];
  ngOnInit(): void {
    this.inputDisplays = this.data.inputDisplays as Display[];
    this.decodedDisplays = (this.data.decodedDisplays ?? []) as Display[];
    this.accentUniqueLengths = this.data.accentUniqueLengths as boolean ?? false;
  }
}
