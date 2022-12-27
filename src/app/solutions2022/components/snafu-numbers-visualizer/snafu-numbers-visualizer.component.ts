import { Component, OnInit } from '@angular/core';
import { BaseResultComponent } from '../../../helper/components/base-result.component';

@Component({
  selector: 'aoc-snafu-numbers-visualizer',
  templateUrl: './snafu-numbers-visualizer.component.html',
  styleUrls: ['./snafu-numbers-visualizer.component.scss'],
})
export class SnafuNumbersVisualizerComponent
  extends BaseResultComponent
  implements OnInit
{
  snafuNumbers!: string[];
  parsedNumbers!: number[];
  finalNumber!: number;
  finalSnafuNumber!: string;

  get factoredSnafuNumber(): string {
    return this.finalSnafuNumber
      .split('')
      .reverse()
      .map(
        (char, idx) =>
          `${char.replace('-', '-1').replace('=', '-2')} * 5^${idx}`
      )
      .reverse()
      .join(' + ');
  }

  ngOnInit(): void {
    this.snafuNumbers = this.data.snafuNumbers as string[];
    this.parsedNumbers = this.data.parsedNumbers as number[];
    this.finalNumber = this.data.finalNumber as number;
    this.finalSnafuNumber = this.data.finalSnafuNumber as string;
  }
}
