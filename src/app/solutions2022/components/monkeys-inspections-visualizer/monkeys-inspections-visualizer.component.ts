import { Component, OnInit } from '@angular/core';
import { BaseResultComponent } from '../../../helper/components/base-result.component';
import { Monkey } from '../../day11.service';

@Component({
  selector: 'aoc-monkeys-inspections-visualizer',
  templateUrl: './monkeys-inspections-visualizer.component.html',
  styleUrls: ['./monkeys-inspections-visualizer.component.scss'],
})
export class MonkeysInspectionsVisualizerComponent
  extends BaseResultComponent
  implements OnInit
{
  currentIdx: number = 0;
  iterations!: number;

  monkeysSnapshots: Monkey[][] = [];

  get monkeys(): Monkey[] {
    return this.monkeysSnapshots[this.currentIdx];
  }

  ngOnInit(): void {
    this.monkeysSnapshots = this.data.monkeysSnapshots as Monkey[][];
    this.iterations = this.monkeysSnapshots.length;
  }
}
