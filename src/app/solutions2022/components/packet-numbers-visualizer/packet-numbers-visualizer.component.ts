import { Component, Input, OnInit } from '@angular/core';
import { BaseResultComponent } from 'src/app/helper/components/base-result.component';
import { PacketNumber } from '../../day13.service';

@Component({
  selector: 'aoc-packet-numbers-visualizer',
  templateUrl: './packet-numbers-visualizer.component.html',
  styleUrls: ['./packet-numbers-visualizer.component.scss'],
})
export class PacketNumbersVisualizerComponent
  extends BaseResultComponent
  implements OnInit
{
  packetNumbersGroups!: PacketNumber[][];
  highlightIndexes!: number[][];

  isHighlighted(i: number, j: number): boolean {
    return this.highlightIndexes.some((pair) => pair[0] === i && pair[1] === j);
  }

  ngOnInit(): void {
    this.packetNumbersGroups = this.data.packetNumbers as PacketNumber[][];
    this.highlightIndexes = this.data.highlightIndexes as number[][];
  }
}
