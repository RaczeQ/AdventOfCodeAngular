import { Injectable } from '@angular/core';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { parseInto2DNumbersArray } from '../helper/util-functions/parse-into-2d-numbers-array';

@Injectable({
  providedIn: 'root',
})
export class Day9Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2021, 9, 'Smoke Basin');
  }
  override solvePart1(input: string): PuzzleResult {
    var heightmapArray = parseInto2DNumbersArray(input);
    var pointsList = heightmapArray.flatMap((row, y) =>
      row.map((col, x) => {
        return { x: x, y: y, val: col };
      })
    );
    var lowPoints = pointsList.filter((pt) => {
      var up = pointsList.find((p) => p.y == pt.y - 1 && p.x == pt.x);
      var down = pointsList.find((p) => p.y == pt.y + 1 && p.x == pt.x);
      var left = pointsList.find((p) => p.y == pt.y && p.x == pt.x - 1);
      var right = pointsList.find((p) => p.y == pt.y && p.x == pt.x + 1);
      return (
        (!up || up.val > pt.val) &&
        (!down || down.val > pt.val) &&
        (!left || left.val > pt.val) &&
        (!right || right.val > pt.val)
      );
    });
    var riskLevels = lowPoints.map((pt) => pt.val + 1).reduce((a, b) => a + b);
    var maxY = pointsList[pointsList.length - 1].y;
    var maxX = pointsList[pointsList.length - 1].x;
    return {
      result: riskLevels,
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            x: pointsList.map((pt) => pt.x),
            y: pointsList.map((pt) => pt.y),
            z: pointsList.map((pt) => pt.val),
            colorscale: 'Blackbody',
            type: 'heatmap',
            colorbar: {
              title: 'Height',
              titlefont: {
                color: '#ffffff',
              },
              tickfont: {
                color: '#ffffff',
              },
            },
          },
          {
            x: lowPoints.map((pt) => pt.x),
            y: lowPoints.map((pt) => pt.y),
            mode: 'markers',
            marker: {
              size: lowPoints.map((pt) => 10),
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
            range: [0 - 0.5, maxX + 0.5],
          },
        },
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var heightmapArray = parseInto2DNumbersArray(input);
    var pointsList = heightmapArray.flatMap((row, y) =>
      row.map((col, x) => {
        return { x: x, y: y, val: col, basin: -1 };
      })
    );
    var currentBasin = 0;
    var basinSizes: number[] = [];
    pointsList.forEach((pt) => {
      if (pt.val < 9 && pt.basin == -1) {
        var finishedFillingBasin = false;
        var basinMembers = [pt];
        var lastBasinSize = 0;
        while (!finishedFillingBasin) {
          basinMembers.forEach((pb) => {
            var up = pointsList.find((p) => p.y == pb.y - 1 && p.x == pb.x);
            var down = pointsList.find((p) => p.y == pb.y + 1 && p.x == pb.x);
            var left = pointsList.find((p) => p.y == pb.y && p.x == pb.x - 1);
            var right = pointsList.find((p) => p.y == pb.y && p.x == pb.x + 1);
            [up, down, left, right].forEach((dir) => {
              if (dir && !basinMembers.includes(dir) && dir.val < 9) {
                basinMembers.push(dir);
              }
            });
          });
          if (basinMembers.length == lastBasinSize) {
            finishedFillingBasin = true;
          }
          lastBasinSize = basinMembers.length;
        }
        basinMembers.forEach((p) => (p.basin = currentBasin));
        basinSizes.push(basinMembers.length);
        currentBasin++;
      }
    });

    var basinTuples = basinSizes
      .map((size, idx) => {
        return { size, idx };
      })
      .sort((one, two) => (one.size > two.size ? -1 : 1));
    var maxY = pointsList[pointsList.length - 1].y;
    var maxX = pointsList[pointsList.length - 1].x;
    return {
      result: basinTuples[0].size * basinTuples[1].size * basinTuples[2].size,
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            x: basinTuples.flatMap((t, i) =>
              pointsList.filter((pt) => pt.basin == t.idx).map((pt) => pt.x)
            ),
            y: basinTuples.flatMap((t, i) =>
              pointsList.filter((pt) => pt.basin == t.idx).map((pt) => pt.y)
            ),
            z: basinTuples.flatMap((t, i) => {
              var points = pointsList.filter((pt) => pt.basin == t.idx);
              return points.map(() => points.length);
            }),
            colorscale: 'Portland',
            type: 'heatmap',
            colorbar: {
              title: 'Basin size',
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
            title: 'Y',
            range: [maxY + 0.5, 0 - 0.5],
          },
          xaxis: {
            title: 'X',
            range: [0 - 0.5, maxX + 0.5],
          },
        },
      },
    };
  }
}
