import { Injectable } from '@angular/core';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { parseIntoNumbers } from '../helper/util-functions/parse-into-numbers';

function mixFile(
  file: number[],
  rounds: number = 1,
  key: number = 1,
  returnOnlyZerothIndex: boolean = false
): { finalBuffer: number[]; indexesMovement: number[][] } {
  var fileDecrypted = file.map((v, idx) => [v * key, idx]);
  var buffer = Object.assign([], fileDecrypted);

  var result: number[][] = [];

  while (rounds > 0) {
    fileDecrypted.forEach((value) => {
      result.push(
        returnOnlyZerothIndex
          ? [buffer.findIndex((num) => num[0] == 0)]
          : buffer.map((v) => v[1])
      );
      const index = buffer.indexOf(value);
      buffer.splice(index, 1);
      buffer.splice((index + value[0]) % buffer.length, 0, value);
    });
    rounds--;
  }

  result.push(
    returnOnlyZerothIndex
      ? [buffer.findIndex((num) => num[0] == 0)]
      : buffer.map((v) => v[1])
  );

  return { finalBuffer: buffer.map((v) => v[0]), indexesMovement: result };
}

@Injectable({
  providedIn: 'root',
})
export class Day20Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(
      solutionsCollectorService,
      2022,
      20,
      'Grove Positioning System',
      'Visualization for part 1 will be sampled down by 10 to speed up rendering.'
    );
  }
  override solvePart1(input: string): PuzzleResult {
    var numbers = parseIntoNumbers(input);
    var mixedData = mixFile(numbers);
    var array = mixedData.finalBuffer;
    var arrays = mixedData.indexesMovement;

    var zeroIndex = array.findIndex((num) => num == 0);

    var result = [1000, 2000, 3000].map(
      (offset) => array[(zeroIndex + offset) % array.length]
    );

    var x: number[] = [];
    var y: number[] = [];
    var z: number[] = [];

    var counter = 0;

    arrays.forEach((array, mixIdx) =>
      array.forEach((value, idx) => {
        if (array.length < 1000 || counter % 10 == 0) {
          x.push(mixIdx);
          y.push(idx);
          z.push(value);
        }
        counter++;
      })
    );

    return {
      result: result.sum(),
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            x,
            y,
            z,
            colorscale: 'Portland',
            type: 'heatmap',
            colorbar: {
              title: 'Original position',
              titlefont: {
                color: '#ffffff',
              },
              tickfont: {
                color: '#ffffff',
              },
            },
          },
        ],
        graphLayout: {
          yaxis: {
            title: 'Numbers array',
            autorange: 'reversed',
          },
          xaxis: {
            title: 'Steps',
            side: 'top',
            automargin: true,
          },
        },
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var numbers = parseIntoNumbers(input);
    var mixedData = mixFile(numbers, 10, 811589153, true);
    var array = mixedData.finalBuffer;
    var arrays = mixedData.indexesMovement;

    var zeroIndex = array.findIndex((num) => num == 0);

    var result = [1000, 2000, 3000].map(
      (offset) => array[(zeroIndex + offset) % array.length]
    );

    return {
      result: result.sum(),
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            x: arrays.map((val, idx) => idx),
            y: arrays.map((val, idx) => val[0]),
            marker: { color: '#fad02c' },
            name: 'Number 0 position',
            showlegend: true,
          },
        ],
        graphLayout: {
          yaxis: { title: 'Numbers array', autorange: 'reversed' },
          xaxis: { title: 'Steps', side: 'top', automargin: true },
        },
      },
    };
  }
}
