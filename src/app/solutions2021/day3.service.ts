import { Injectable } from '@angular/core';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
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
export class Day3Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2021, 3, 'Binary Diagnostic');
  }
  override solvePart1(input: string): PuzzleResult {
    var lines = splitIntoLines(input);
    var columns = lines[0].length;
    var zeros = Array(columns).fill(0);
    var ones = Array(columns).fill(0);

    lines.forEach((line) => {
      [...line].forEach((char, idx) => {
        char == '0' ? zeros[idx]++ : ones[idx]++;
      });
    });

    var gammaBinary = '';
    var epsilonBinary = '';
    for (let i = 0; i < columns; i++) {
      gammaBinary += Number(zeros[i] < ones[i]);
      epsilonBinary += Number(zeros[i] > ones[i]);
    }
    var gamma = parseInt(gammaBinary, 2);
    var epsilon = parseInt(epsilonBinary, 2);

    return {
      result: gamma * epsilon,
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            x: lines.flatMap((line, x) =>
              line
                .split('')
                .map(Number)
                .map((num, y) => x)
            ),
            y: lines.flatMap((line, x) =>
              line
                .split('')
                .map(Number)
                .map((num, y) => Math.pow(2, y).toString())
            ),
            z: lines.flatMap((line, x) =>
              line
                .split('')
                .map(Number)
                .map((num, y) => num)
            ),
            colorscale: 'Greys',
            type: 'heatmap',
            colorbar: {
              tickfont: {
                color: '#ffffff',
              },
              tickvals: [0, 1],
            },
          },
          {
            x: gammaBinary.split('').map((pt) => lines.length + 5),
            y: gammaBinary.split('').map((pt, idx) => Math.pow(2, Number(idx))),
            text: gammaBinary.split(''),
            mode: 'text',
            type: 'scatter',
            showlegend: false,
            textfont: {
              color: '#fad02c',
            },
          },
          {
            x: epsilonBinary.split('').map((pt) => lines.length + 15),
            y: epsilonBinary
              .split('')
              .map((pt, idx) => Math.pow(2, Number(idx))),
            text: epsilonBinary.split(''),
            mode: 'text',
            type: 'scatter',
            showlegend: false,
            textfont: {
              color: '#fad02c',
            },
          },
          {
            x: [lines.length + 5, lines.length + 15],
            y: [Math.pow(2, columns - 1) + 15, Math.pow(2, columns - 1) + 15],
            text: ['γ', 'ε'],
            textposition: 'outside',
            mode: 'text',
            type: 'scatter',
            showlegend: false,
            textfont: {
              color: '#fad02c',
            },
          },
        ],
        graphLayout: {
          yaxis: {
            title: 'Powers of 2',
            autotypenumbers: 'strict',
            tickvals: lines[0].split('').map((c, idx) => Math.pow(2, idx)),
          },
          xaxis: {
            title: 'Number',
          },
        },
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var lines = splitIntoLines(input);
    var columns = lines[0].length;
    var oxygenLines = lines.map((l) => l);
    var carbonLines = lines.map((l) => l);
    var oxygenLinesLengths = [oxygenLines.length];
    var carbonLinesLengths = [carbonLines.length];
    var oxygenLine: string = '';
    var carbonLine: string = '';
    for (let i = 0; i < columns; i++) {
      if (oxygenLine.length == 0) {
        var oxygenOnes = oxygenLines.filter((l) => Number(l[i] == '1')).length;
        var oxygenZeros = oxygenLines.filter((l) => Number(l[i] == '0')).length;

        var oxygenLines = oxygenLines.filter(
          (l) => l[i] == Number(oxygenZeros <= oxygenOnes).toString()
        );
        oxygenLinesLengths.push(oxygenLines.length);
        if (oxygenLines.length == 1) {
          oxygenLine = oxygenLines[0];
        }
      }

      if (carbonLine.length == 0) {
        var carbonOnes = carbonLines.filter((l) => Number(l[i] == '1')).length;
        var carbonZeros = carbonLines.filter((l) => Number(l[i] == '0')).length;
        var carbonLines = carbonLines.filter(
          (l) => l[i] == Number(carbonZeros > carbonOnes).toString()
        );
        carbonLinesLengths.push(carbonLines.length);
        if (carbonLines.length == 1) {
          carbonLine = carbonLines[0];
        }
      }
    }
    var oxygenValue = parseInt(oxygenLine, 2);
    var carbonValue = parseInt(carbonLine, 2);

    var sources: number[] = [];
    var targets: number[] = [];
    var values: number[] = [];
    oxygenLinesLengths
      .slice(0, oxygenLinesLengths.length - 1)
      .forEach((v, idx) => {
        sources.push(idx);
        targets.push(idx + 1);
      });
    sources.push(0);
    carbonLinesLengths
      .slice(1, carbonLinesLengths.length - 1)
      .forEach((v, idx) => {
        sources.push(idx + oxygenLinesLengths.length);
        targets.push(idx + oxygenLinesLengths.length);
      });
    targets.push(targets[targets.length - 1] + 1);
    values = oxygenLinesLengths.slice(1).concat(carbonLinesLengths.slice(1));
    return {
      result: oxygenValue * carbonValue,
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            type: 'sankey',
            orientation: 'h',
            hoverinfo: 'none',
            node: {
              label: oxygenLinesLengths
                .slice(0, oxygenLinesLengths.length - 1)
                .map((n) => n.toString())
                .concat([`1 (${oxygenLine})`])
                .concat(
                  carbonLinesLengths
                    .slice(1, carbonLinesLengths.length - 1)
                    .map((n) => n.toString())
                )
                .concat([`1 (${carbonLine})`]),
              pad: 15,
              thickness: 15,
              line: {
                color: 'black',
                width: 0.5,
              },
            },
            link: {
              source: sources,
              target: targets,
              value: values,
              color: '#00000080',
              opacity: 0.5,
            },
          },
        ],
        graphLayout: {
          font: {
            color: '#fad02c',
          },
        },
      },
    };
  }
}
