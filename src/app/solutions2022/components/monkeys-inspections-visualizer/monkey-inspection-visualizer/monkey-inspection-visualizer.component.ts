import { Component, Input } from '@angular/core';
import { Monkey } from 'src/app/solutions2022/day11.service';

@Component({
  selector: 'aoc-monkey-inspection-visualizer',
  templateUrl: './monkey-inspection-visualizer.component.html',
  styleUrls: ['./monkey-inspection-visualizer.component.scss'],
})
export class MonkeyInspectionVisualizerComponent {
  @Input() monkeyId!: number;
  @Input() monkeyInspection!: Monkey;

  get items(): string {
    return this.monkeyInspection.items.map((item) => item.value).join(', ');
  }
}
