import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { manhattan2D } from '../helper/util-functions/distances';
import { Point2D, points2DEqual } from '../helper/util-functions/point';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';

export interface Sensor extends Point2D {
  closestBeacon: Point2D;
  coverDistance: number;
}

function parseSensors(input: string): Sensor[] {
  var result: Sensor[] = [];
  splitIntoLines(input).map((line) => {
    var matches = Array.from(
      line.matchAll(
        /Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/gs
      )
    )[0];
    var sensorPosition: Point2D = {
      x: Number(matches[1]),
      y: Number(matches[2]),
    };
    var beaconPosition: Point2D = {
      x: Number(matches[3]),
      y: Number(matches[4]),
    };
    result.push({
      x: sensorPosition.x,
      y: sensorPosition.y,
      closestBeacon: beaconPosition,
      coverDistance: manhattan2D(sensorPosition, beaconPosition),
    });
  });
  return result;
}

function checkLine(
  sensors: Sensor[],
  yLine: number,
  xMin: number,
  xMax: number
): Point2D[] {
  var coveredPositions = new Set(
    sensors
      .filter((sensor) => Math.abs(sensor.y - yLine) <= sensor.coverDistance)
      .flatMap((sensor) => {
        var distance = Math.abs(sensor.y - yLine);
        var spread = sensor.coverDistance - distance;
        return Array.range(sensor.x - spread, sensor.x + spread + 1).filter(
          (x) =>
            x >= xMin &&
            x <= xMax &&
            (sensor.closestBeacon.y != yLine ||
              (sensor.closestBeacon.y == yLine && sensor.closestBeacon.x != x))
        );
      })
  );
  return Array.from(coveredPositions).map((x) => {
    return { x, y: yLine };
  });
}

function mapIntoRanges(
  sensors: Sensor[],
  y: number
): { xMin: number; xMax: number }[] {
  var ranges: { xMin: number; xMax: number }[] = [];
  sensors
    .filter((sensor) => Math.abs(sensor.y - y) <= sensor.coverDistance)
    .forEach((sensor) => {
      var distance = Math.abs(sensor.y - y);
      var spread = sensor.coverDistance - distance;
      var xMin = sensor.x - spread;
      var xMax = sensor.x + spread;
      ranges.push({ xMin, xMax });
    });
  ranges.sort((a, b) => a.xMin - b.xMin);

  var result: { xMin: number; xMax: number }[] = [];
  ranges.forEach((range) => {
    if (result.length > 0 && result[result.length - 1].xMax >= range.xMin - 1) {
      result[result.length - 1].xMax = Math.max(
        result[result.length - 1].xMax,
        range.xMax
      );
    } else {
      result.push(range);
    }
  });
  return result;
}

function findAvailableSpace(
  sensors: Sensor[],
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number
): Point2D | undefined {
  var occupiedPositions: Set<string> = new Set(
    sensors.flatMap((sensor) => [
      `${sensor.x}|${sensor.y}`,
      `${sensor.closestBeacon.x}|${sensor.closestBeacon.y}`,
    ])
  );
  var foundPoint: Point2D | undefined = undefined;
  for (let y = yMin; y < yMax + 1; y++) {
    var occupiedRanges = mapIntoRanges(sensors, y);
    if (occupiedRanges.length == 1) continue;
    for (let x = xMin; x < xMax + 1; x++) {
      var candidate = { x, y };
      if (
        sensors.every(
          (sensor) => manhattan2D(sensor, candidate) > sensor.coverDistance
        ) &&
        !occupiedPositions.has(`${x}|${y}`)
      ) {
        return candidate;
      }
    }
  }
  return foundPoint;
}

@Injectable({
  providedIn: 'root',
})
export class Day15Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(
      solutionsCollectorService,
      2022,
      15,
      'Beacon Exclusion Zone',
      'For visualization purposes, service automatically detects if input is from example or real. This is required for adjustment of constant value.'
    );
  }
  override solvePart1(input: string): PuzzleResult {
    var sensors = parseSensors(input);
    var yLine = sensors.some((sensor) => sensor.y > 20) ? 2000000 : 10;
    var blockedPositions = checkLine(
      sensors,
      yLine,
      Math.min(...sensors.map((sensor) => sensor.x - sensor.coverDistance)),
      Math.max(...sensors.map((sensor) => sensor.x + sensor.coverDistance))
    );
    var ranges = mapIntoRanges(sensors, yLine);
    return {
      result: blockedPositions.length,
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            x: sensors.map((sensor) => sensor.closestBeacon.x),
            y: sensors.map((sensor) => sensor.closestBeacon.y),
            mode: 'markers',
            type: 'scatter',
            name: 'Beacons',
            marker: {
              size: 10,
            },
            textfont: {
              color: '#ffffff',
            },
          },
          {
            x: sensors.map((sensor) => sensor.x),
            y: sensors.map((sensor) => sensor.y),
            mode: 'markers',
            type: 'scatter',
            name: 'Sensors',
            marker: {
              size: 10,
              color: '#ffffff',
            },
            textfont: {
              color: '#ffffff',
            },
          },
        ],
        graphLayout: {
          yaxis: { title: 'Y', autorange: 'reversed' },
          xaxis: { title: 'X' },
          shapes: [
            ...sensors.flatMap((sensor) => [
              {
                type: 'line',
                xref: 'x',
                yref: 'y',
                x0: sensor.x + sensor.coverDistance,
                y0: sensor.y,
                x1: sensor.x,
                y1: sensor.y + sensor.coverDistance,
                line: {
                  color: '#ffffff',
                  width: 1,
                },
                opacity: 0.5,
              },
              {
                type: 'line',
                xref: 'x',
                yref: 'y',
                x0: sensor.x,
                y0: sensor.y + sensor.coverDistance,
                x1: sensor.x - sensor.coverDistance,
                y1: sensor.y,
                line: {
                  color: '#ffffff',
                  width: 1,
                },
                opacity: 0.5,
              },
              {
                type: 'line',
                xref: 'x',
                yref: 'y',
                x0: sensor.x - sensor.coverDistance,
                y0: sensor.y,
                x1: sensor.x,
                y1: sensor.y - sensor.coverDistance,
                line: {
                  color: '#ffffff',
                  width: 1,
                },
                opacity: 0.5,
              },
              {
                type: 'line',
                xref: 'x',
                yref: 'y',
                x0: sensor.x,
                y0: sensor.y - sensor.coverDistance,
                x1: sensor.x + sensor.coverDistance,
                y1: sensor.y,
                line: {
                  color: '#ffffff',
                  width: 1,
                },
                opacity: 0.5,
              },
            ]),
            ...ranges.map((range) => {
              return {
                type: 'line',
                xref: 'x',
                yref: 'y',
                x0: range.xMin,
                y0: yLine,
                x1: range.xMax,
                y1: yLine,
                line: {
                  color: '#fad02c',
                  width: 3,
                },
                opacity: 1,
              };
            }),
          ],
        },
        graphConfig: {
          displayModeBar: false,
          staticPlot: false,
        },
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var sensors = parseSensors(input);
    var maxCoordinate = sensors.some((sensor) => sensor.y > 20) ? 4000000 : 20;
    var foundPosition = findAvailableSpace(
      sensors,
      0,
      maxCoordinate,
      0,
      maxCoordinate
    )!;
    return {
      result: foundPosition.x * 4000000 + foundPosition.y,
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            x: sensors.map((sensor) => sensor.closestBeacon.x),
            y: sensors.map((sensor) => sensor.closestBeacon.y),
            mode: 'markers',
            type: 'scatter',
            name: 'Beacons',
            marker: {
              size: 10,
            },
            textfont: {
              color: '#ffffff',
            },
          },
          {
            x: sensors.map((sensor) => sensor.x),
            y: sensors.map((sensor) => sensor.y),
            mode: 'markers',
            type: 'scatter',
            name: 'Sensors',
            marker: {
              size: 10,
              color: '#ffffff',
            },
            textfont: {
              color: '#ffffff',
            },
          },
          {
            x: [foundPosition.x],
            y: [foundPosition.y],
            mode: 'markers',
            type: 'scatter',
            name: `Found position (x=${foundPosition.x}, y=${foundPosition.y})`,
            marker: {
              size: 20,
              color: '#fad02c',
            },
            textfont: {
              color: '#fad02c',
            },
          },
        ],
        graphLayout: {
          yaxis: { title: 'Y', autorange: 'reversed' },
          xaxis: { title: 'X' },
          shapes: sensors.flatMap((sensor) => [
            {
              type: 'line',
              xref: 'x',
              yref: 'y',
              x0: sensor.x + sensor.coverDistance,
              y0: sensor.y,
              x1: sensor.x,
              y1: sensor.y + sensor.coverDistance,
              line: {
                color: '#ffffff',
                width: 1,
              },
              opacity: 0.5,
            },
            {
              type: 'line',
              xref: 'x',
              yref: 'y',
              x0: sensor.x,
              y0: sensor.y + sensor.coverDistance,
              x1: sensor.x - sensor.coverDistance,
              y1: sensor.y,
              line: {
                color: '#ffffff',
                width: 1,
              },
              opacity: 0.5,
            },
            {
              type: 'line',
              xref: 'x',
              yref: 'y',
              x0: sensor.x - sensor.coverDistance,
              y0: sensor.y,
              x1: sensor.x,
              y1: sensor.y - sensor.coverDistance,
              line: {
                color: '#ffffff',
                width: 1,
              },
              opacity: 0.5,
            },
            {
              type: 'line',
              xref: 'x',
              yref: 'y',
              x0: sensor.x,
              y0: sensor.y - sensor.coverDistance,
              x1: sensor.x + sensor.coverDistance,
              y1: sensor.y,
              line: {
                color: '#ffffff',
                width: 1,
              },
              opacity: 0.5,
            },
          ]),
        },
        graphConfig: {
          displayModeBar: false,
          staticPlot: false,
        },
      },
    };
  }
}
