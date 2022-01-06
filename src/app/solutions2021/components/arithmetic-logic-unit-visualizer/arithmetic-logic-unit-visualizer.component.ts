import { Component, OnInit } from '@angular/core';
import { BaseResultComponent } from 'src/app/helper/components/base-result.component';

@Component({
  selector: 'aoc-arithmetic-logic-unit-visualizer',
  templateUrl: './arithmetic-logic-unit-visualizer.component.html',
  styleUrls: ['./arithmetic-logic-unit-visualizer.component.scss'],
})
export class ArithmeticLogicUnitVisualizerComponent
  extends BaseResultComponent
  implements OnInit
{
  currentDigitIdx: number = 0;
  instructions: [string, Map<string, number>][][] = [];
  number!: string;
  ngOnInit(): void {
    this.number = this.data.number as string;
    this.instructions = this.data.instructions as [
      string,
      Map<string, number>
    ][][];
  }

  nextStep() {
    this.currentDigitIdx++;
  }

  prevStep() {
    this.currentDigitIdx--;
  }
}
