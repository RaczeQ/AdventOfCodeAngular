import { Injectable } from '@angular/core';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { Point3D } from '../helper/util-functions/point';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';

@Injectable({
  providedIn: 'root',
})
export class Day19Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2021, 19, 'Beacon Scanner');
  }
  rotations: ['x' | 'y' | 'z', 1 | -1][][] = [
    [
      ['x', 1],
      ['y', 1],
      ['z', 1],
    ],
    [
      ['x', 1],
      ['z', -1],
      ['y', 1],
    ],
    [
      ['x', 1],
      ['y', -1],
      ['z', -1],
    ],
    [
      ['x', 1],
      ['z', 1],
      ['y', -1],
    ],

    [
      ['y', 1],
      ['z', 1],
      ['x', 1],
    ],
    [
      ['y', 1],
      ['x', -1],
      ['z', 1],
    ],
    [
      ['y', 1],
      ['z', -1],
      ['x', -1],
    ],
    [
      ['y', 1],
      ['x', 1],
      ['z', -1],
    ],

    [
      ['z', 1],
      ['x', 1],
      ['y', 1],
    ],
    [
      ['z', 1],
      ['y', -1],
      ['x', 1],
    ],
    [
      ['z', 1],
      ['x', -1],
      ['y', -1],
    ],
    [
      ['z', 1],
      ['y', 1],
      ['x', -1],
    ],

    [
      ['x', -1],
      ['y', -1],
      ['z', 1],
    ],
    [
      ['x', -1],
      ['z', -1],
      ['y', -1],
    ],
    [
      ['x', -1],
      ['y', 1],
      ['z', -1],
    ],
    [
      ['x', -1],
      ['z', 1],
      ['y', 1],
    ],

    [
      ['y', -1],
      ['z', -1],
      ['x', 1],
    ],
    [
      ['y', -1],
      ['x', -1],
      ['z', -1],
    ],
    [
      ['y', -1],
      ['z', 1],
      ['x', -1],
    ],
    [
      ['y', -1],
      ['x', 1],
      ['z', 1],
    ],

    [
      ['z', -1],
      ['x', -1],
      ['y', 1],
    ],
    [
      ['z', -1],
      ['y', -1],
      ['x', -1],
    ],
    [
      ['z', -1],
      ['x', 1],
      ['y', -1],
    ],
    [
      ['z', -1],
      ['y', 1],
      ['x', 1],
    ],
  ];
  private generateRotations(pt: Point3D): Point3D[] {
    return this.rotations.map((rot) => {
      return {
        x: pt[rot[0][0]] * rot[0][1],
        y: pt[rot[1][0]] * rot[1][1],
        z: pt[rot[2][0]] * rot[2][1],
      };
    });
  }
  private rotate(pt: Point3D, rot: ['x' | 'y' | 'z', 1 | -1][]): Point3D {
    return {
      x: pt[rot[0][0]] * rot[0][1],
      y: pt[rot[1][0]] * rot[1][1],
      z: pt[rot[2][0]] * rot[2][1],
    };
  }
  private areOverlapping(a: Point3D, b: Point3D): boolean {
    var d1x = Math.abs(a.x);
    var d1y = Math.abs(a.y);
    var d1z = Math.abs(a.z);
    var d2x = Math.abs(b.x);
    var d2y = Math.abs(b.y);
    var d2z = Math.abs(b.z);
    if (
      (d1x == d2x && d1y == d2y && d1z == d2z) ||
      (d1x == d2x && d1y == d2z && d1z == d2y) ||
      (d1x == d2y && d1y == d2x && d1z == d2z) ||
      (d1x == d2y && d1y == d2z && d1z == d2x) ||
      (d1x == d2z && d1y == d2x && d1z == d2y) ||
      (d1x == d2z && d1y == d2y && d1z == d2z)
    ) {
      return true;
    }
    return false;
  }
  private getScanners(input: string): Point3D[][] {
    var lines = splitIntoLines(input);
    var scanners: Point3D[][] = [];
    lines
      .filter((l) => l.trim().length > 0)
      .forEach((line) => {
        if (line.startsWith('---')) {
          scanners.push([]);
        } else {
          var numbers = line.split(',').map(Number);
          scanners.slice(-1)[0].push({
            x: numbers[0],
            y: numbers[1],
            z: numbers[2],
          });
        }
      });
    return scanners;
  }

  private orientScanners(scanners: Point3D[][]): {
    scannerRotations: { [key: number]: ['x' | 'y' | 'z', 1 | -1][] };
    scannerPositions: { [key: number]: Point3D };
  } {
    var scannerRotations: { [key: number]: ['x' | 'y' | 'z', 1 | -1][] } = {
      0: this.rotations[0],
    };
    var scannerPositions: { [key: number]: Point3D } = {
      0: { x: 0, y: 0, z: 0 },
    };
    var tries = scanners.length;
    while (
      tries > 0 &&
      Object.keys(scannerPositions).length < scanners.length
    ) {
      tries--;
      scanners.forEach((scanner1, sidx1) => {
        if (sidx1 in scannerRotations) {
          scanners.forEach((scanner2, sidx2) => {
            if (!(sidx2 in scannerPositions)) {
              if (sidx1 !== sidx2) {
                var distances1: {
                  b1idx: number;
                  b2idx: number;
                  dist: Point3D;
                }[] = [];
                var distances2: {
                  b1idx: number;
                  b2idx: number;
                  dist: Point3D;
                }[] = [];
                scanner1.forEach((beacon1, bidx1) => {
                  scanner1.forEach((beacon2, bidx2) => {
                    if (bidx1 < bidx2) {
                      distances1.push({
                        b1idx: bidx1,
                        b2idx: bidx2,
                        dist: {
                          x: beacon1.x - beacon2.x,
                          y: beacon1.y - beacon2.y,
                          z: beacon1.z - beacon2.z,
                        },
                      });
                    }
                  });
                });
                scanner2.forEach((beacon1, bidx1) => {
                  scanner2.forEach((beacon2, bidx2) => {
                    if (bidx1 < bidx2) {
                      distances2.push({
                        b1idx: bidx1,
                        b2idx: bidx2,
                        dist: {
                          x: beacon1.x - beacon2.x,
                          y: beacon1.y - beacon2.y,
                          z: beacon1.z - beacon2.z,
                        },
                      });
                    }
                  });
                });
                var mappedBeacons: { [key: number]: number[] } = {};
                distances1.forEach((dist1) => {
                  distances2.forEach((dist2) => {
                    if (this.areOverlapping(dist1.dist, dist2.dist)) {
                      if (!(dist1.b1idx in mappedBeacons)) {
                        mappedBeacons[dist1.b1idx] = [dist2.b1idx, dist2.b2idx];
                      } else if (
                        mappedBeacons[dist1.b1idx].includes(dist2.b1idx)
                      ) {
                        mappedBeacons[dist1.b1idx] = [dist2.b1idx];
                      } else if (
                        mappedBeacons[dist1.b1idx].includes(dist2.b2idx)
                      ) {
                        mappedBeacons[dist1.b1idx] = [dist2.b2idx];
                      }
                      if (!(dist1.b2idx in mappedBeacons)) {
                        mappedBeacons[dist1.b2idx] = [dist2.b1idx, dist2.b2idx];
                      } else if (
                        mappedBeacons[dist1.b2idx].includes(dist2.b1idx)
                      ) {
                        mappedBeacons[dist1.b2idx] = [dist2.b1idx];
                      } else if (
                        mappedBeacons[dist1.b2idx].includes(dist2.b2idx)
                      ) {
                        mappedBeacons[dist1.b2idx] = [dist2.b2idx];
                      }
                    }
                  });
                });
                if (
                  Object.keys(mappedBeacons).length >= 3 && // Just bruteforce all rotations, sorry not sorry ;)
                  Object.values(mappedBeacons).every((v) => v.length == 1)
                ) {
                  var rotationIdx: number | undefined;
                  this.rotations.forEach((rot, rotIdx) => {
                    if (!rotationIdx) {
                      var x2xDist: number[] = [];
                      var y2yDist: number[] = [];
                      var z2zDist: number[] = [];
                      Object.entries(mappedBeacons).forEach(([k, v]) => {
                        var b1 = this.rotate(
                          scanner1[Number(k)],
                          scannerRotations[sidx1]
                        );
                        var b2 = this.rotate(scanner2[v[0]], rot);
                        x2xDist.push(b1.x - b2.x);
                        y2yDist.push(b1.y - b2.y);
                        z2zDist.push(b1.z - b2.z);
                      });
                      if (
                        x2xDist.every((p) => p === x2xDist[0]) &&
                        y2yDist.every((p) => p === y2yDist[0]) &&
                        z2zDist.every((p) => p === z2zDist[0])
                      ) {
                        rotationIdx = rotIdx;
                      }
                    }
                  });
                  scannerRotations[sidx2] = this.rotations[rotationIdx!];
                  var b1 = this.rotate(
                    scanner1[Number(Object.keys(mappedBeacons)[0])],
                    scannerRotations[sidx1]
                  );

                  var b2 = this.rotate(
                    scanner2[Object.values(mappedBeacons)[0][0]],
                    scannerRotations[sidx2]
                  );
                  scannerPositions[sidx2] = {
                    x: scannerPositions[sidx1].x + b1.x - b2.x,
                    y: scannerPositions[sidx1].y + b1.y - b2.y,
                    z: scannerPositions[sidx1].z + b1.z - b2.z,
                  };
                }
              }
            }
          });
        }
      });
    }
    return {
      scannerPositions: scannerPositions,
      scannerRotations: scannerRotations,
    };
  }

  private mapBeacons(
    scanners: Point3D[][],
    scannerRotations: { [key: number]: ['x' | 'y' | 'z', 1 | -1][] },
    scannerPositions: { [key: number]: Point3D }
  ): Point3D[] {
    var result: Point3D[] = [];
    scanners.forEach((beacons, scannerId) => {
      if (scannerId in scannerPositions) {
        beacons.forEach((beacon) => {
          var rotatedBeacon = this.rotate(beacon, scannerRotations[scannerId]);
          result.push({
            x: scannerPositions[scannerId].x + rotatedBeacon.x,
            y: scannerPositions[scannerId].y + rotatedBeacon.y,
            z: scannerPositions[scannerId].z + rotatedBeacon.z,
          });
        });
      }
    });
    result = result.filter(
      (beacon, index, self) =>
        index ===
        self.findIndex(
          (b) => b.x == beacon.x && b.y == beacon.y && b.z == beacon.z
        )
    );
    return result;
  }

  override solvePart1(input: string): PuzzleResult {
    var scanners = this.getScanners(input);
    var { scannerRotations, scannerPositions } = this.orientScanners(scanners);
    var beacons = this.mapBeacons(scanners, scannerRotations, scannerPositions);
    return {
      result: beacons.length,
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            x: beacons.map((p) => p.x),
            y: beacons.map((p) => p.y),
            z: beacons.map((p) => p.z),
            mode: 'markers',
            type: 'scatter3d',
            name: 'Beacons',
            marker: {
              size: 5,
              line: {
                color: 'rgba(217, 217, 217, 0.14)',
                width: 0.5,
              },
              opacity: 0.8,
            },
            textfont: {
              color: '#ffffff',
            },
          },
          {
            x: Object.values(scannerPositions).map((p) => p.x),
            y: Object.values(scannerPositions).map((p) => p.y),
            z: Object.values(scannerPositions).map((p) => p.z),
            mode: 'markers',
            type: 'scatter3d',
            name: 'Scanners',
            marker: {
              size: 5,
              color: '#fad02c',
              line: {
                color: 'rgb(38, 38, 38)',
                width: 0.5,
              },
              opacity: 0.8,
            },
            textfont: {
              color: '#ffffff',
            },
          },
        ],
        graphLayout: {
          yaxis: { title: 'Y' },
          xaxis: { title: 'X' },
          zaxis: { title: 'Z' },
        },
        graphConfig: {
          displayModeBar: false,
          staticPlot: false,
        },
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var scanners = this.getScanners(input);
    var { scannerRotations, scannerPositions } = this.orientScanners(scanners);

    var furthestScanners: number[] = [];
    var maxDistance: number = 0;
    var scannerIdxs = Object.keys(scannerPositions).map(Number);
    scannerIdxs.forEach((s1) => {
      scannerIdxs.forEach((s2) => {
        if (s1 > s2) {
          var pos1 = scannerPositions[s1];
          var pos2 = scannerPositions[s2];
          var dist =
            Math.abs(pos1.x - pos2.x) +
            Math.abs(pos1.y - pos2.y) +
            Math.abs(pos1.z - pos2.z);
          if (dist > maxDistance) {
            maxDistance = dist;
            furthestScanners = [s1, s2];
          }
        }
      });
    });
    return {
      result: maxDistance,
      component: PlotlyGraphComponent,
      componentData: {
        graphData: scannerIdxs
          .flatMap((s1) => {
            return scannerIdxs.map((s2) => {
              return { s1, s2 };
            });
          })
          .filter((t) => t.s1 > t.s2)
          .map((t) => {
            var trace: any = {
              x: [scannerPositions[t.s1].x, scannerPositions[t.s2].x],
              y: [scannerPositions[t.s1].y, scannerPositions[t.s2].y],
              z: [scannerPositions[t.s1].z, scannerPositions[t.s2].z],
              mode: 'markers',
              type: 'scatter3d',
              showlegend: false,
              legendgroup: 'crab',
              line: {
                color: 'rgba(255, 255, 255, 0.5)',
              },
              marker: {
                color: '#ffffff',
                size: 5,
                line: {
                  color: 'rgba(217, 217, 217, 0.14)',
                  width: 0.5,
                },
                opacity: 0.8,
              },
              textfont: {
                color: '#ffffff',
              },
            };
            return trace;
          })
          .concat([
            {
              x: [
                scannerPositions[furthestScanners[0]].x,
                scannerPositions[furthestScanners[1]].x,
              ],
              y: [
                scannerPositions[furthestScanners[0]].y,
                scannerPositions[furthestScanners[1]].y,
              ],
              z: [
                scannerPositions[furthestScanners[0]].z,
                scannerPositions[furthestScanners[1]].z,
              ],
              mode: 'markers+lines',
              type: 'scatter3d',
              showlegend: false,
              legendgroup: 'crab',
              line: {
                color: '#fad02c',
              },
              marker: {
                color: '#fad02c',
                size: 5,
                line: {
                  color: 'rgb(38, 38, 38)',
                  width: 0.5,
                },
                opacity: 0.8,
              },
              textfont: {
                color: '#ffffff',
              },
            },
          ]),
        graphLayout: {
          yaxis: { title: 'Y' },
          xaxis: { title: 'X' },
          zaxis: { title: 'Z' },
        },
        graphConfig: {
          displayModeBar: false,
          staticPlot: false,
        },
      },
    };
  }
}
