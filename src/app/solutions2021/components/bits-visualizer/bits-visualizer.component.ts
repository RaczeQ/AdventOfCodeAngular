import { Component, Input, OnInit } from '@angular/core';
import { BaseResultComponent } from 'src/app/helper/components/base-result.component';
import { Packet } from '../../day16.service';

@Component({
  selector: 'aoc-bits-visualizer',
  templateUrl: './bits-visualizer.component.html',
  styleUrls: ['./bits-visualizer.component.scss'],
})
export class BitsVisualizerComponent
  extends BaseResultComponent
  implements OnInit
{
  @Input() packet!: Packet;
  @Input() depth: number = 0;
  @Input() separators: number[] = [];
  @Input() isChild: boolean = false;
  @Input() isLast: boolean = true;
  @Input() showValues: boolean = false;

  ngOnInit(): void {
    if (this.data) {
      this.packet = this.data.packet as Packet;
      this.showValues = this.data.showValues as boolean;
    }
  }

  getOperator(typeId: number): string {
    switch (typeId) {
      case 0:
        return '+';
      case 1:
        return '×';
      case 2:
        return 'Min';
      case 3:
        return 'Max';
      case 5:
        return '>';
      case 6:
        return '<';
      case 7:
        return '=';
      default:
        return '';
    }
  }
}
