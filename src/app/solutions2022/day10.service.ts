import { Injectable } from '@angular/core';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { ScriptsLoaderService } from '../helper/services/scripts-loader.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { OCR } from '../helper/util-functions/ocr';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';

function parseInstructions(input: string): number[] {
  var registerValue = 1;
  var instructions = splitIntoLines(input, true);

  var registerValues: number[] = [];

  instructions.forEach((instruction) => {
    registerValues.push(registerValue);
    if (instruction != 'noop') {
      registerValues.push(registerValue);
      registerValue += Number(instruction.split(' ')[1]);
    }
  });

  return registerValues;
}

@Injectable({
  providedIn: 'root',
})
export class Day10Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(
    solutionsCollectorService: SolutionsCollectorService,
    private scriptsLoaderService: ScriptsLoaderService
  ) {
    super(
      solutionsCollectorService,
      2022,
      10,
      'Cathode-Ray Tube',
      'Part 2 features automatic OCR using tesseract.js library but it might contain errors (eg. K is detected as E). Please look at the diagram below for correct answer.'
    );
  }
  override solvePart1(input: string): PuzzleResult {
    var registerValues = parseInstructions(input);
    var signalStrengths: number[] = [];
    for (let index = 20; index < registerValues.length; index += 40) {
      signalStrengths.push(registerValues[index - 1] * index);
    }
    return {
      result: signalStrengths.sum(),
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            x: registerValues.map((_, idx) => idx + 1),
            y: registerValues,
            mode: 'lines',
            name: 'Register values',
            line: {
              color: '#fad02c',
            },
          },
        ],
        graphLayout: {
          yaxis: { title: 'Register value' },
          xaxis: { title: 'Cycle' },
        },
      },
    };
  }
  override async solvePart2(input: string): Promise<PuzzleResult> {
    var registerValues = parseInstructions(input);
    var crtMatrix = Array.range(0, 6).map((row) =>
      Array.range(0, 40).map((column) => {
        var currentCycle = column + 1 + row * 40;
        var currentRegisterValue = registerValues[currentCycle - 1];
        var spriteRange = Array.range(
          currentRegisterValue - 1,
          currentRegisterValue + 2
        );
        return Number(spriteRange.includes(column));
      })
    );
    var xValues = crtMatrix.flatMap((row, y) => row.map((value, x) => x + 1));
    var yValues = crtMatrix.flatMap((row, y) => row.map((value, x) => y + 1));
    var zValues = crtMatrix.flatMap((row, y) => row.map((value, x) => value));
    return OCR(xValues, yValues, zValues, this.scriptsLoaderService).then(
      (txt) => {
        return {
          result: txt,
          component: PlotlyGraphComponent,
          componentData: {
            graphData: [
              {
                x: xValues,
                y: yValues,
                z: zValues,
                colorscale: [
                  ['0.0', 'rgba(255,255,255,0)'],
                  ['1.0', '#fad02c'],
                ],
                type: 'heatmap',
                colorbar: {
                  tickfont: {
                    color: '#ffffff',
                  },
                },
                showscale: false,
                xgap: 1,
                ygap: 1,
              },
            ],
            graphLayout: {
              yaxis: {
                title: 'Y',
                range: [6 + 0.5, 1 - 0.5],
              },
              xaxis: {
                title: 'X',
                automargin: true,
              },
              scene: {
                aspectmode: 'data',
              },
            },
          },
        };
      }
    );
  }
}
