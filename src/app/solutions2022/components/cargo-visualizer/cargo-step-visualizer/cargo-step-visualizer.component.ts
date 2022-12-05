import { Component, Input } from '@angular/core';
import { Stack } from '../../../../helper/util-functions/stack';

interface CargoElement {
  value: string;
  row: number;
  col: number;
}

@Component({
  selector: 'aoc-cargo-step-visualizer',
  templateUrl: './cargo-step-visualizer.component.html',
  styleUrls: ['./cargo-step-visualizer.component.scss'],
})
export class CargoStepVisualizerComponent {
  @Input() stacks: Stack<string>[] = [];
  @Input() showColumns: boolean = true;
  @Input() glowColumn?: number;

  get cargoElements(): CargoElement[] {
    return this.stacks.flatMap((stack, col) =>
      stack.store.map((element, row) => {
        return { value: element, row, col };
      })
    );
  }

  get columns(): number[] {
    return this.stacks.map((s, idx) => idx);
  }
}
