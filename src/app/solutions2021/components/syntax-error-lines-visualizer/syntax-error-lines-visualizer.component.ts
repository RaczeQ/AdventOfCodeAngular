import { Component, OnInit } from '@angular/core';
import { BaseResultComponent } from 'src/app/helper/components/base-result.component';

@Component({
  selector: 'aoc-syntax-error-lines-visualizer',
  templateUrl: './syntax-error-lines-visualizer.component.html',
  styleUrls: ['./syntax-error-lines-visualizer.component.scss'],
})
export class SyntaxErrorLinesVisualizerComponent
  extends BaseResultComponent
  implements OnInit
{
  lines!: string[];
  results!: string[];
  scores!: number[];
  medianScore: number | undefined;

  ngOnInit(): void {
    this.lines = this.data.lines as string[];
    this.results = this.data.results as string[];
    this.scores = this.data.scores as number[];
    this.medianScore = this.data.medianScore as number;
  }
}
