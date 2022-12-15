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

// function checkSpace(sensors: Sensor[], positions: Point2D[]): Point2D[] {
//   var coveredPositions = new Set(
//     sensors
//       // .filter((sensor) => Math.abs(sensor.y - yLine) <= sensor.coverDistance)
//       .flatMap((sensor) => {
//         var distance = Math.abs(sensor.y - yLine);
//         var spread = sensor.coverDistance - distance;
//         return Array.range(sensor.x - spread, sensor.x + spread + 1).filter(
//           (x) =>
//             sensor.closestBeacon.y != yLine ||
//             (sensor.closestBeacon.y == yLine && sensor.closestBeacon.x != x)
//         );
//       })
//   );
//   return Array.from(coveredPositions).map((x) => {
//     return { x, y: yLine };
//   });
// }

@Injectable({
  providedIn: 'root',
})
export class Day15Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2022, 15, 'Beacon Exclusion Zone');
  }
  override solvePart1(input: string): PuzzleResult {
    var sensors = parseSensors(input);
    var blockedPositions = checkLine(
      sensors,
      2000000,
      Math.min(...sensors.map((sensor) => sensor.x - sensor.coverDistance)),
      Math.max(...sensors.map((sensor) => sensor.x + sensor.coverDistance))
    );
    return {
      result: blockedPositions.length,
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [],
        graphLayout: {},
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var maxCoordinate = 4000000;
    var sensors = parseSensors(input);
    var beacons = sensors.map((s) => s.closestBeacon);
    var foundPosition!: Point2D;
    for (let yIndex = 0; yIndex < maxCoordinate + 1; yIndex++) {
      var blockedPositions = checkLine(sensors, yIndex, 0, maxCoordinate);
      if (blockedPositions.length < maxCoordinate + 1) {
        var xCoordinates = blockedPositions.map((pos) => pos.x);
        foundPosition = {
          y: yIndex,
          x: Array.range(0, maxCoordinate + 1).find(
            (x) => !xCoordinates.includes(x)
          )!,
        };
        if (
          sensors.some((sensor) => points2DEqual(sensor, foundPosition)) ||
          beacons.some((beacon) => points2DEqual(beacon, foundPosition))
        ) {
          continue;
        }
        break;
      }
    }
    console.log(foundPosition);
    return {
      result: foundPosition.x * 4000000 + foundPosition.y,
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [],
        graphLayout: {},
      },
    };
  }
}
