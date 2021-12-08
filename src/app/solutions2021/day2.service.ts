import { Injectable } from '@angular/core';
import { PlotlyGraphComponentComponent } from '../helper/components/plotly-graph-component/plotly-graph-component.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';

@Injectable({
  providedIn: 'root',
})
export class Day2Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2021, 2, 'Dive!');
  }
  private parseCommands(input: string): [string, number][] {
    var commands = splitIntoLines(input);
    return commands.map((command) => {
      var parts = command.split(' ');
      return [parts[0], Number(parts[1])];
    });
  }
  override solvePart1(input: string): PuzzleResult {
    var commands = this.parseCommands(input);
    var depth = 0;
    var position = 0;
    var depths = [depth];
    var positions = [position];
    commands.forEach((command) => {
      switch (command[0]) {
        case 'forward':
          position += command[1];
          break;
        case 'up':
          depth -= command[1];
          break;
        case 'down':
          depth += command[1];
          break;
      }
      depths.push(depth);
      positions.push(position);
    });
    return {
      result: depth * position,
      component: PlotlyGraphComponentComponent,
      componentData: {
        graphData: [
          {
            x: positions,
            y: depths,
            mode: 'lines',
            name: 'Measurements',
            line: {
              color: 'rgba(#ffffff, 0.8)',
            },
          },
        ],
        graphLayout: {
          yaxis: { title: 'Depth', autorange: 'reversed' },
          xaxis: { title: 'Position' },
        },
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var commands = this.parseCommands(input);
    var depth = 0;
    var position = 0;
    var aim = 0;
    var depths = [depth];
    var positions = [position];
    commands.forEach((command) => {
      switch (command[0]) {
        case 'forward':
          position += command[1];
          depth += command[1] * aim;
          break;
        case 'up':
          aim -= command[1];
          break;
        case 'down':
          aim += command[1];
          break;
      }
      depths.push(depth);
      positions.push(position);
    });
    return {
      result: depth * position,
      component: PlotlyGraphComponentComponent,
      componentData: {
        graphData: [
          {
            x: positions,
            y: depths,
            mode: 'lines',
            name: 'Measurements',
            line: {
              color: 'rgba(#ffffff, 0.8)',
            },
          },
        ],
        graphLayout: {
          yaxis: { title: 'Depth', autorange: 'reversed' },
          xaxis: { title: 'Position' },
        },
      },
    };
  }
}
