import { Injectable } from '@angular/core';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';
import { CampSectionsVisualizerComponent } from './components/camp-sections-visualizer/camp-sections-visualizer.component';

export class Sections {
  protected elf1Start: number;
  protected elf1End: number;
  protected elf2Start: number;
  protected elf2End: number;

  constructor(inputLine: string) {
    var parts = inputLine.split(',');
    var elf1Range = parts[0].split('-').map(Number);
    var elf2Range = parts[1].split('-').map(Number);

    this.elf1Start = elf1Range[0];
    this.elf1End = elf1Range[1];

    this.elf2Start = elf2Range[0];
    this.elf2End = elf2Range[1];
  }

  get ranges(): [number[], number[]] {
    return [
      Array.range(this.elf1Start, this.elf1End + 1),
      Array.range(this.elf2Start, this.elf2End + 1),
    ];
  }

  get isTotalOverlap(): boolean {
    return (
      (this.elf1Start <= this.elf2Start && this.elf1End >= this.elf2End) ||
      (this.elf2Start <= this.elf1Start && this.elf2End >= this.elf1End)
    );
  }

  get overlapLength(): number {
    var ranges = this.ranges;
    var frequency = ranges[0]
      .concat(ranges[1])
      .reduce(function (acc: { [item: number]: number }, curr: number) {
        return acc[curr] ? ++acc[curr] : (acc[curr] = 1), acc;
      }, {});
    return Object.entries(frequency).filter(([key, value]) => value > 1).length;
  }
}

@Injectable({
  providedIn: 'root',
})
export class Day4Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2022, 4, 'Camp Cleanup');
  }
  override solvePart1(input: string): PuzzleResult {
    var sections = splitIntoLines(input).map((line) => new Sections(line));
    return {
      result: sections.filter((x) => x.isTotalOverlap).length,
      component: CampSectionsVisualizerComponent,
      componentData: {
        sections: sections.map((section) => section.ranges),
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var sections = splitIntoLines(input).map((line) => new Sections(line));
    var overlaps = sections.map((x) => x.overlapLength);
    var overlapsFrequency = overlaps.reduce(function (
      acc: { [item: number]: number },
      curr: number
    ) {
      return acc[curr] ? ++acc[curr] : (acc[curr] = 1), acc;
    },
    {});
    return {
      result: overlaps.filter((x) => x > 0).length,
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            x: Object.entries(overlapsFrequency).map(([key, value]) => key),
            y: Object.entries(overlapsFrequency).map(([key, value]) => value),
            type: 'bar',
            marker: { color: '#fad02c' },
          },
        ],
        graphLayout: {
          yaxis: { title: 'Count' },
          xaxis: { title: 'Overlap size', automargin: true },
        },
      },
    };
  }
}
