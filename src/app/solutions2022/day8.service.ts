import { Injectable } from '@angular/core';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { parseInto2DNumbersArray } from '../helper/util-functions/parse-into-2d-numbers-array';
import { Point2D } from '../helper/util-functions/point';

function isTreeVisible(
  treesGrid: number[][],
  row: number,
  col: number
): boolean {
  var isVisibleEdge =
    row == 0 ||
    row == treesGrid.length - 1 ||
    col == 0 ||
    col == treesGrid[0].length - 1;

  var isVisibleInside =
    treesGrid[row].slice(0, col).every((x) => x < treesGrid[row][col]) ||
    treesGrid[row].slice(col + 1).every((x) => x < treesGrid[row][col]) ||
    treesGrid.slice(0, row).every((x) => x[col] < treesGrid[row][col]) ||
    treesGrid.slice(row + 1).every((x) => x[col] < treesGrid[row][col]);

  return isVisibleEdge || isVisibleInside;
}

function scenicScore(
  treesGrid: number[][],
  row: number,
  col: number
): [number, Point2D[]] {
  var coordinates: Point2D[] = [];
  var subScores: number[] = [];

  var left = Array.range(0, col)
    .reverse()
    .map((c) => {
      return { y: row, x: c };
    });

  var right = Array.range(col + 1, treesGrid[row].length).map((c) => {
    return { y: row, x: c };
  });

  var top = Array.range(0, row)
    .reverse()
    .map((r) => {
      return { y: r, x: col };
    });

  var bottom = Array.range(row + 1, treesGrid.length).map((r) => {
    return { y: r, x: col };
  });

  [left, right, top, bottom].forEach((coords) => {
    let counter = 0;
    for (let i = 0; i < coords.length; i++) {
      counter++;
      coordinates.push(coords[i]);
      if (treesGrid[coords[i].y][coords[i].x] >= treesGrid[row][col]) {
        break;
      }
    }
    subScores.push(counter);
  });

  return [subScores.reduce((a, b) => a * b), coordinates];
}

@Injectable({
  providedIn: 'root',
})
export class Day8Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2022, 8, 'Treetop Tree House');
  }
  override solvePart1(input: string): PuzzleResult {
    var treesGrid = parseInto2DNumbersArray(input);
    var treesGridParsed = treesGrid.flatMap((row, rowIdx) =>
      row.map((col, colIdx) => {
        return {
          rowIdx,
          colIdx,
          isVisible: Number(isTreeVisible(treesGrid, rowIdx, colIdx)),
        };
      })
    );
    var visibleTrees = treesGridParsed.filter(
      ({ rowIdx, colIdx, isVisible }) => isVisible
    );
    var hiddenTrees = treesGridParsed.filter(
      ({ rowIdx, colIdx, isVisible }) => !isVisible
    );

    return {
      result: visibleTrees.length,
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            type: 'cone',
            x: visibleTrees.map((t) => t.colIdx + 1),
            y: visibleTrees.map((t) => t.rowIdx + 1),
            z: visibleTrees.map(
              (t) => (treesGrid[t.rowIdx][t.colIdx] + 1) / 10
            ),
            u: visibleTrees.map((t) => 0),
            v: visibleTrees.map((t) => 0),
            w: visibleTrees.map((t) => 0.075),
            sizemode: 'absolute',
            sizeref: 1,
            anchor: 'tip',
            colorscale: [
              [0, '#fad02c'],
              [1, '#fad02c'],
            ],
            showscale: false,
          },
          {
            type: 'cone',
            x: hiddenTrees.map((t) => t.colIdx + 1),
            y: hiddenTrees.map((t) => t.rowIdx + 1),
            z: hiddenTrees.map((t) => (treesGrid[t.rowIdx][t.colIdx] + 1) / 10),
            u: hiddenTrees.map((t) => 0),
            v: hiddenTrees.map((t) => 0),
            w: hiddenTrees.map((t) => 0.075),
            sizemode: 'absolute',
            sizeref: 1,
            anchor: 'tip',
            colorscale: [
              [0, '#00ff8d'],
              [1, '#00ff8d'],
            ],
            opacity: 0.25,
            showscale: false,
          },
        ],
        graphLayout: {
          // scene: {
          //   camera: {
          //     eye: { x: -0.76, y: 1.8, z: 0.92 },
          //   },
          // },
          scene: {
            yaxis: { autorange: 'reversed' },
          },
        },
        graphConfig: {
          displayModeBar: false,
          staticPlot: false,
        },
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var treesGrid = parseInto2DNumbersArray(input);
    var scores = treesGrid
      .flatMap((row, rowIdx) =>
        row.map((col, colIdx) => {
          var [score, coordinates] = scenicScore(treesGrid, rowIdx, colIdx);
          return {
            rowIdx,
            colIdx,
            score,
            coordinates,
          };
        })
      )
      .sort((a, b) => b.score - a.score);

    var restOfTrees = scores
      .slice(1)
      .filter(
        (t) =>
          !scores[0].coordinates.some(
            (c) => c.y === t.rowIdx && c.x === t.colIdx
          )
      );
    return {
      result: scores[0].score,
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            type: 'cone',
            x: restOfTrees.map((t) => t.colIdx + 1),
            y: restOfTrees.map((t) => t.rowIdx + 1),
            z: restOfTrees.map((t) => (treesGrid[t.rowIdx][t.colIdx] + 1) / 10),
            u: restOfTrees.map((t) => 0),
            v: restOfTrees.map((t) => 0),
            w: restOfTrees.map((t) => 0.075),
            sizemode: 'absolute',
            sizeref: 1,
            anchor: 'tip',
            colorscale: [
              [0, '#00ff8d'],
              [1, '#00ff8d'],
            ],
            opacity: 0.25,
            showscale: false,
          },
          {
            type: 'cone',
            x: scores[0].coordinates.map((t) => t.x + 1),
            y: scores[0].coordinates.map((t) => t.y + 1),
            z: scores[0].coordinates.map((t) => (treesGrid[t.y][t.x] + 1) / 10),
            u: scores[0].coordinates.map((t) => 0),
            v: scores[0].coordinates.map((t) => 0),
            w: scores[0].coordinates.map((t) => 0.075),
            sizemode: 'absolute',
            sizeref: 1,
            anchor: 'tip',
            colorscale: [
              [0, '#fad02c'],
              [1, '#fad02c'],
            ],
            opacity: 0.5,
            showscale: false,
          },
          {
            type: 'cone',
            x: [scores[0].colIdx + 1],
            y: [scores[0].rowIdx + 1],
            z: [(treesGrid[scores[0].rowIdx][scores[0].colIdx] + 1) / 10],
            u: [0],
            v: [0],
            w: [0.075],
            sizemode: 'absolute',
            sizeref: 1,
            anchor: 'tip',
            colorscale: [
              [0, '#fad02c'],
              [1, '#fad02c'],
            ],
            showscale: false,
          },
        ],
        graphLayout: {
          // scene: {
          //   camera: {
          //     eye: { x: -0.76, y: 1.8, z: 0.92 },
          //   },
          // },
          scene: {
            yaxis: { autorange: 'reversed' },
          },
        },
        graphConfig: {
          displayModeBar: false,
          staticPlot: false,
        },
      },
    };
  }
}
