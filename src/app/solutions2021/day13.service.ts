import { Injectable } from '@angular/core';
import { PlotlyGraphComponentComponent } from '../helper/components/plotly-graph-component/plotly-graph-component.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { ScriptsLoaderService } from '../helper/services/scripts-loader.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';

declare let Tesseract: any;

@Injectable({
  providedIn: 'root',
})
export class Day13Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(
    solutionsCollectorService: SolutionsCollectorService,
    private scriptsLoaderService: ScriptsLoaderService
  ) {
    super(
      solutionsCollectorService,
      2021,
      13,
      'Transparent Origami',
      'Part 2 features automatic OCR using tesseract.js library but it might contain errors (eg. K is detected as E). Please look at the diagram below for correct answer.'
    );
  }
  private fold(
    input: string,
    onlyOnce: boolean = false
  ): { x: number; y: number }[] {
    var lines = splitIntoLines(input);
    var dots: { x: number; y: number }[] = [];
    var folded = false;
    lines.forEach((line) => {
      if (line.startsWith('f') && (!folded || !onlyOnce)) {
        var split = line.trim().split('=');
        var number = Number(split[1]);
        var isX = split[0].endsWith('x');
        folded = true;
        dots = dots.map((d) => {
          var newDot = { x: d.x, y: d.y };
          if (isX && d.x > number) {
            newDot.x = 2 * number - d.x;
          } else if (!isX && d.y > number) {
            newDot.y = 2 * number - d.y;
          }
          return newDot;
        });
      } else if (line.includes(',')) {
        var parts = line.trim().split(',').map(Number);
        dots.push({ x: parts[0], y: parts[1] });
      }
    });
    return dots;
  }
  private async OCR(x: number[], y: number[], z: number[]): Promise<string> {
    var maxX = Math.max(...x);
    var maxY = Math.max(...y);

    var canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    let image = document.getElementById('source');
    const magnifier = 5;
    canvas.width = magnifier * (maxX + 3);
    canvas.height = magnifier * (maxY + 3);
    for (let i = 0; i < x.length; i++) {
      if (z[i] > 0) {
        ctx?.fillRect(
          (x[i] + 1) * magnifier,
          (y[i] + 1) * magnifier,
          magnifier,
          magnifier
        );
      }
    }
    const data = canvas.toDataURL();
    return this.scriptsLoaderService
      .loadScript(
        'Tesseract',
        'https://unpkg.com/tesseract.js@v2.1.0/dist/tesseract.min.js'
      )
      .then((res) => {
        return Tesseract.recognize(data, 'eng', {}).then((data: any) => {
          return data.data.text;
        });
      });
  }
  override solvePart1(input: string): PuzzleResult {
    var dots = this.fold(input, true);
    var maxX = Math.max(...dots.map((d) => d.x));
    var maxY = Math.max(...dots.map((d) => d.y));
    var uniqueDots = dots.filter(
      (dot, index, self) =>
        index === self.findIndex((d) => d.x == dot.x && d.y == dot.y)
    );
    return {
      result: uniqueDots.length,
      component: PlotlyGraphComponentComponent,
      componentData: {
        graphData: [
          {
            x: uniqueDots.map((d) => d.x),
            y: uniqueDots.map((d) => d.y),
            z: uniqueDots.map(
              (d) =>
                dots.filter((dprim) => d.x == dprim.x && d.y == dprim.y).length
            ),
            colorscale: 'Portland',
            type: 'heatmap',
            colorbar: {
              tickfont: {
                color: '#ffffff',
              },
            },
          },
        ],
        graphLayout: {
          yaxis: { title: 'Y', range: [maxY + 0.5, 0 - 0.5] },
          xaxis: { title: 'X', range: [0 - 0.5, maxX + 0.5] },
        },
      },
    };
  }
  override async solvePart2(input: string): Promise<PuzzleResult> {
    var dots = this.fold(input, false);
    var maxX = Math.max(...dots.map((d) => d.x));
    var maxY = Math.max(...dots.map((d) => d.y));
    var uniqueDots = dots.filter(
      (dot, index, self) =>
        index === self.findIndex((d) => d.x == dot.x && d.y == dot.y)
    );
    for (let x = 0; x <= maxX; x++) {
      for (let y = 0; y <= maxY; y++) {
        var d = uniqueDots.find((d) => d.x == x && d.y == y);
        if (d) {
          dots.push(d);
        } else {
          uniqueDots.push({ x: x, y: y });
        }
      }
    }
    var xValues = uniqueDots.map((d) => d.x);
    var yValues = uniqueDots.map((d) => d.y);
    var zValues = uniqueDots.map(
      (d) => dots.filter((dprim) => d.x == dprim.x && d.y == dprim.y).length
    );
    return this.OCR(xValues, yValues, zValues).then((txt) => {
      return {
        result: txt,
        component: PlotlyGraphComponentComponent,
        componentData: {
          graphData: [
            {
              x: xValues,
              y: yValues,
              z: zValues,
              colorscale: [
                ['0.0', 'rgba(255,255,255,0)'],
                [(1 / Math.max(...zValues)).toString(), '#ffffff'],
                ['1.0', '#fad02c'],
              ],
              type: 'heatmap',
              colorbar: {
                tickfont: {
                  color: '#ffffff',
                },
              },
            },
          ],
          graphLayout: {
            yaxis: {
              title: 'Y',
              range: [maxY + 0.5, 0 - 0.5],
            },
            xaxis: {
              title: 'X',
            },
          },
        },
      };
    });
  }
}
