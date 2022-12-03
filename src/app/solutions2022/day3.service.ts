import { Injectable } from '@angular/core';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';

export interface Rucksack {
  compartment1: string[];
  compartment2: string[];
}

function splitInHalf(line: string): Rucksack {
  var compartmentlength = line.length / 2;
  return {
    compartment1: line.slice(0, compartmentlength).split(''),
    compartment2: line.slice(compartmentlength).split(''),
  };
}

function commonItem(rucksack: Rucksack): string {
  return rucksack.compartment1.find((item) =>
    rucksack.compartment2.includes(item)
  )!;
}

function commonBadge(rucksacks: Rucksack[]): string {
  var totalContents = rucksacks.map((r) =>
    r.compartment1.concat(r.compartment2)
  );
  return totalContents[0].find((item) =>
    totalContents.slice(1).every((content) => content.includes(item))
  )!;
}

function itemPriority(item: string): number {
  var priority = item.charCodeAt(0) - 38;
  if (item === item.toLowerCase()) {
    priority -= 58;
  }
  return priority;
}

@Injectable({
  providedIn: 'root',
})
export class Day3Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2022, 3, 'Rucksack Reorganization');
  }
  override solvePart1(input: string): PuzzleResult {
    var rucksacks = splitIntoLines(input).map(splitInHalf);
    var commonItems = rucksacks.map(commonItem);
    var itemsPriorities = commonItems.map(itemPriority);
    var itemsFrequency = commonItems.reduce(function (
      acc: { [item: string]: number },
      curr: string
    ) {
      return acc[curr] ? ++acc[curr] : (acc[curr] = 1), acc;
    },
    {});
    return {
      result: itemsPriorities.sum(),
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            x: Object.entries(itemsFrequency).map(([key, value]) => key),
            y: Object.entries(itemsFrequency).map(([key, value]) => value),
            type: 'bar',
            marker: { color: '#fad02c' },
          },
        ],
        graphLayout: {
          yaxis: { title: 'Count' },
          xaxis: { title: 'Item', automargin: true },
        },
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var rucksacks = splitIntoLines(input).map(splitInHalf);
    var groups = rucksacks.chunk(3);
    var badges = groups.map(commonBadge);
    var badgesPriorities = badges.map(itemPriority);
    var badgesFrequency = badges.reduce(function (
      acc: { [item: string]: number },
      curr: string
    ) {
      return acc[curr] ? ++acc[curr] : (acc[curr] = 1), acc;
    },
    {});
    return {
      result: badgesPriorities.sum(),
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            x: Object.entries(badgesFrequency).map(([key, value]) => key),
            y: Object.entries(badgesFrequency).map(([key, value]) => value),
            type: 'bar',
            marker: { color: '#fad02c' },
          },
        ],
        graphLayout: {
          yaxis: { title: 'Count' },
          xaxis: { title: 'Item', automargin: true },
        },
      },
    };
  }
}
