import { Injectable } from '@angular/core';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { Point3D, points3DEqual } from '../helper/util-functions/point';
import { Queue } from '../helper/util-functions/queue';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';

function mapToCubes(input: string): Point3D[] {
  return splitIntoLines(input, true).map((line) => {
    var coords = line.split(',');
    return { x: Number(coords[0]), y: Number(coords[1]), z: Number(coords[2]) };
  });
}

function calculateTotalSurfaceArea(cubes: Point3D[]): [number, number[]] {
  var directions: Point3D[] = [
    { x: -1, y: 0, z: 0 },
    { x: 1, y: 0, z: 0 },
    { x: 0, y: -1, z: 0 },
    { x: 0, y: 1, z: 0 },
    { x: 0, y: 0, z: -1 },
    { x: 0, y: 0, z: 1 },
  ];
  var visibleFaces = 0;
  var cubesVisibleFaces: number[] = [];
  cubes.forEach((cube) => {
    var cubeVisibleFaces = 0;
    directions.forEach((direction) => {
      var adjacentCube: Point3D = {
        x: cube.x + direction.x,
        y: cube.y + direction.y,
        z: cube.z + direction.z,
      };
      if (cubes.every((otherCube) => !points3DEqual(otherCube, adjacentCube))) {
        cubeVisibleFaces += 1;
      }
    });
    cubesVisibleFaces.push(cubeVisibleFaces);
    visibleFaces += cubeVisibleFaces;
  });
  return [visibleFaces, cubesVisibleFaces];
}

function calculateExternalSurfaceArea(cubes: Point3D[]): [number, Point3D[]] {
  var directions: Point3D[] = [
    { x: -1, y: 0, z: 0 },
    { x: 1, y: 0, z: 0 },
    { x: 0, y: -1, z: 0 },
    { x: 0, y: 1, z: 0 },
    { x: 0, y: 0, z: -1 },
    { x: 0, y: 0, z: 1 },
  ];
  var minX = Math.min(...cubes.map((cube) => cube.x)) - 1;
  var maxX = Math.max(...cubes.map((cube) => cube.x)) + 1;
  var minY = Math.min(...cubes.map((cube) => cube.y)) - 1;
  var maxY = Math.max(...cubes.map((cube) => cube.y)) + 1;
  var minZ = Math.min(...cubes.map((cube) => cube.z)) - 1;
  var maxZ = Math.max(...cubes.map((cube) => cube.z)) + 1;
  var visited: Point3D[] = [];
  var queue = new Queue<Point3D>();
  queue.enqueue({ x: minX, y: minY, z: minZ });
  while (!queue.isEmpty()) {
    var currentPosition = queue.dequeue()!;
    visited.push(currentPosition);
    directions.forEach((direction) => {
      var newPosition: Point3D = {
        x: currentPosition.x + direction.x,
        y: currentPosition.y + direction.y,
        z: currentPosition.z + direction.z,
      };
      if (
        newPosition.x >= minX &&
        newPosition.x <= maxX &&
        newPosition.y >= minY &&
        newPosition.y <= maxY &&
        newPosition.z >= minZ &&
        newPosition.z <= maxZ &&
        queue.store.every(
          (queuedPosition) => !points3DEqual(queuedPosition, newPosition)
        ) &&
        visited.every(
          (visitedPosition) => !points3DEqual(visitedPosition, newPosition)
        ) &&
        cubes.every((cubePosition) => !points3DEqual(cubePosition, newPosition))
      ) {
        queue.enqueue(newPosition);
      }
    });
  }
  var emptyFaces = 0;
  var filteredCubes: Point3D[] = [];
  cubes.forEach((cube) => {
    directions.forEach((direction) => {
      var adjacentPosition: Point3D = {
        x: cube.x + direction.x,
        y: cube.y + direction.y,
        z: cube.z + direction.z,
      };
      if (
        visited.some((otherCube) => points3DEqual(otherCube, adjacentPosition))
      ) {
        emptyFaces += 1;
        if (
          filteredCubes.every(
            (cubePosition) => !points3DEqual(cubePosition, cube)
          )
        ) {
          filteredCubes.push(cube);
        }
      }
    });
  });
  return [emptyFaces, filteredCubes];
}

function getAllPoints(cube: Point3D): Point3D[] {
  return [
    { x: cube.x, y: cube.y, z: cube.z },
    { x: cube.x, y: cube.y + 1, z: cube.z },
    { x: cube.x + 1, y: cube.y + 1, z: cube.z },
    { x: cube.x + 1, y: cube.y, z: cube.z },
    { x: cube.x, y: cube.y, z: cube.z + 1 },
    { x: cube.x, y: cube.y + 1, z: cube.z + 1 },
    { x: cube.x + 1, y: cube.y + 1, z: cube.z + 1 },
    { x: cube.x + 1, y: cube.y, z: cube.z + 1 },
  ];
}

@Injectable({
  providedIn: 'root',
})
export class Day18Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2022, 18, 'Boiling Boulders');
  }
  override solvePart1(input: string): PuzzleResult {
    var cubes = mapToCubes(input);
    var [result, cubesVisibleFaces] = calculateTotalSurfaceArea(cubes);
    const occurrences = cubesVisibleFaces.reduce(function (
      acc: { [x: number]: number },
      curr
    ) {
      return acc[curr] ? ++acc[curr] : (acc[curr] = 1), acc;
    },
    {});
    var occurrencesArray = Array.range(0, 7).map(
      (faces) => occurrences[faces] ?? 0
    );
    return {
      result: result,
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            x: occurrencesArray.map((val, idx) => idx),
            y: occurrencesArray.map((val, idx) => val),
            type: 'bar',
            marker: { color: '#fad02c' },
          },
        ],
        graphLayout: {
          yaxis: { title: 'Number of cubes' },
          xaxis: { title: 'Exposed faces', type: 'category', automargin: true },
        },
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var cubes = mapToCubes(input);
    var [result, filteredCubes] = calculateExternalSurfaceArea(cubes);
    var mappedPoints = cubes.flatMap((c) => getAllPoints(c));
    var x = mappedPoints.flatMap((c) => c.x);
    var y = mappedPoints.flatMap((c) => c.y);
    var z = mappedPoints.flatMap((c) => c.z);
    var i = cubes.flatMap((c, idx) =>
      [7, 0, 0, 0, 4, 4, 6, 6, 4, 0, 3, 2].map((v) => v + idx * 8)
    );
    var j = cubes.flatMap((c, idx) =>
      [3, 4, 1, 2, 5, 6, 5, 2, 0, 1, 6, 3].map((v) => v + idx * 8)
    );
    var k = cubes.flatMap((c, idx) =>
      [0, 7, 2, 3, 6, 7, 1, 1, 5, 5, 7, 6].map((v) => v + idx * 8)
    );
    return {
      result: result,
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            type: 'mesh3d',
            x,
            y,
            z,
            i,
            j,
            k,
            color: 'rgba(250, 208, 44, 1.0)',
            contour: {
              show: true,
            },
            flatshading: true,
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
}
