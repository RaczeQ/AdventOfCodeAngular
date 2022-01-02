import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { Point2D } from '../helper/util-functions/point';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';

interface Field {
  allowedStop: boolean;
  allowedFinish?: string;
  occupant?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Day23Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2021, 23, 'Amphipod');
  }

  private costs: { [char: string]: number } = {
    A: 1,
    B: 10,
    C: 100,
    D: 1000,
  };

  private positions: [string, number][] = [
    ['A', 3],
    ['B', 5],
    ['C', 7],
    ['D', 9],
  ];

  private calculatedCosts: { [idx: number]: { [char: string]: number } } = {};

  private calculatedDistances: {
    [startIdx: number]: { [destIdx: number]: number[] };
  } = {};

  private parseInput(lines: string[]): [Field[], Point2D[]] {
    var fields: Field[] = [];
    var positions: Point2D[] = [];
    lines.forEach((line, y) => {
      line.split('').forEach((char, x) => {
        if (char.trim() != '' && char != '#') {
          positions.push({ x, y });
          var field: Field = {
            allowedStop: !(y > 1 || [3, 5, 7, 9].includes(x)),
          };
          if (char != '.') {
            field.occupant = char;
          }
          if (y > 1) {
            field.allowedFinish = this.positions.find((pos) => pos[1] == x)![0];
          }
          fields.push(field);
        }
      });
    });
    return [fields, positions];
  }

  private getNeighbourhoods(fields: Point2D[]): { [id: number]: number[] } {
    var result: { [id: number]: number[] } = {};
    fields.forEach((field, idx) => {
      var up = fields.findIndex((f) => f.x == field.x && f.y == field.y - 1);
      var left = fields.findIndex((f) => f.x == field.x - 1 && f.y == field.y);
      var right = fields.findIndex((f) => f.x == field.x + 1 && f.y == field.y);
      var down = fields.findIndex((f) => f.x == field.x && f.y == field.y + 1);
      result[idx] = [up, left, right, down].filter((f) => f > -1);
    });
    return result;
  }

  private copyFields(fields: Field[]): Field[] {
    return JSON.parse(JSON.stringify(fields)) as Field[];
  }

  private swapPositions(
    fields: Field[],
    startIdx: number,
    endIdx: number
  ): Field[] {
    var result = this.copyFields(fields);
    result[startIdx].occupant = fields[endIdx].occupant;
    result[endIdx].occupant = fields[startIdx].occupant;
    return result;
  }

  private checkIfLaneIsValid(
    fieldIdx: number,
    fields: Field[],
    neighbours: { [id: number]: number[] }
  ): boolean {
    var currentIdx = fieldIdx;
    var laneFields = [];
    while (Math.max(...neighbours[currentIdx]) > currentIdx) {
      currentIdx = Math.max(...neighbours[currentIdx]);
      laneFields.push(fields[currentIdx]);
    }
    return laneFields.every(
      (f) => f.allowedFinish && (!f.occupant || f.occupant == f.allowedFinish)
    );
  }

  // private pathsCache: { [key: string]: [number, number][] } = {};

  private generateAllPaths(
    fieldIdx: number,
    fields: Field[],
    neighbours: { [id: number]: number[] },
    previousFieldIdx: number | undefined = undefined
  ): [number, number][] {
    var result: [number, number][] = [];
    var currentField = fields[fieldIdx];
    if (
      previousFieldIdx ||
      !(
        currentField.allowedFinish &&
        currentField.allowedFinish == currentField.occupant &&
        neighbours[fieldIdx].length == 1
      )
    ) {
      // if (!previousFieldIdx) {
      //   console.log(fieldIdx, currentField.occupant, currentField);
      // }
      neighbours[fieldIdx]
        .filter((nIdx) => nIdx != previousFieldIdx && !fields[nIdx].occupant)
        .forEach((nIdx) => {
          result.push([nIdx, 1]);
          this.generateAllPaths(nIdx, fields, neighbours, fieldIdx).forEach(
            (t) => {
              t[1] += 1;
              result.push(t);
            }
          );
        });
      if (!previousFieldIdx && result.length > 0) {
        result = result.filter((r) => {
          var canMoveToTheEnd =
            Math.max(...neighbours[r[0]]) < r[0] &&
            fields[r[0]].allowedFinish == currentField.occupant;
          var canFillRoom =
            fields[r[0]].allowedFinish == currentField.occupant &&
            this.checkIfLaneIsValid(r[0], fields, neighbours);
          return (
            canMoveToTheEnd ||
            canFillRoom ||
            (currentField.allowedFinish && fields[r[0]].allowedStop)
          );
        });
      }
    }
    return result;
  }

  private movesCache: { [key: string]: [string, number][] } = {};

  private validMoves(
    fields: Field[],
    neighbours: { [id: number]: number[] }
  ): [Field[], number][] {
    var result: [Field[], number][] = [];
    fields.forEach((field, fieldIdx) => {
      if (field.occupant) {
        var subResult: [Field[], number][] = [];
        // var key = this.generateHash(fieldIdx, fields, neighbours);
        // if (key in this.movesCache) {
        //   this.movesCache[key].forEach(([state, cost]) =>
        //     result.push([JSON.parse(state) as Field[], cost])
        //   );
        // } else {
        var paths = this.generateAllPaths(fieldIdx, fields, neighbours);
        paths.forEach(([nIdx, cost]) => {
          subResult.push([
            this.swapPositions(fields, fieldIdx, nIdx),
            cost * this.costs[field.occupant!],
          ]);
        });
        // this.movesCache[key] = subResult.map(([state, cost]) => [
        //   JSON.stringify(state),
        //   cost,
        // ]);
        result.push(...subResult);
        // }
      }
    });

    return result;
  }

  private isFinished(fields: Field[]): boolean {
    return fields.every(
      (f) => !f.allowedFinish || f.allowedFinish == f.occupant
    );
  }

  private heuristicCache: { [key: string]: number } = {};

  private heuristic(
    fields: Field[],
    neighbours: { [id: number]: number[] }
  ): number {
    var key = this.printState(fields);
    if (key in this.heuristicCache) {
      return this.heuristicCache[key];
    }
    // var costs = fields
    //   .map((f, idx) => {
    //     return { f, idx };
    //   })
    //   .filter((t) => t.f.occupant && t.f.occupant != t.f.allowedFinish)
    //   .map((t) => this.calculatedCosts[t.idx][t.f.occupant!]);

    var gapsCost = fields
      .map((f, idx) => {
        return { f, idx };
      })
      .filter(
        (t) =>
          t.f.allowedFinish &&
          !t.f.occupant &&
          fields[Math.min(...neighbours[t.idx])].allowedFinish &&
          fields[Math.min(...neighbours[t.idx])].occupant ==
            fields[Math.min(...neighbours[t.idx])].allowedFinish
      )
      .map((t) => this.costs[t.f.allowedFinish!]);

    // var corridors = fields.filter((f) => !f.allowedFinish).length;
    var corridorsCost =
      fields.filter((f) => !f.allowedFinish && f.occupant).length * 10000;
    var wrongFinishesCost = fields
      .map((f, idx) => {
        return { f, idx };
      })
      .filter(
        (t) =>
          t.f.allowedFinish && t.f.occupant && t.f.occupant != t.f.allowedFinish
      )
      .map((t) => this.costs[t.f.allowedFinish!]);

    // var blockedFinishesCost = fields
    //   .map((f, idx) => {
    //     return { f, idx };
    //   })
    //   .filter(
    //     (t) =>
    //       t.f.allowedFinish &&
    //       t.f.occupant &&
    //       // t.f.occupant == t.f.allowedFinish &&
    //       !this.checkIfLaneIsValid(t.idx, fields, neighbours)
    //   )
    //   .map((t) => {
    //     return { f: t.f, d: Math.floor((t.idx - corridors) / 4) + 2 };
    //   })
    //   .map((t) => this.costs[t.f.allowedFinish!] * t.d);

    var paths = fields
      .map((f, idx) => {
        return { f, idx };
      })
      .filter(
        (t) =>
          t.f.occupant &&
          fields.some(
            (f) =>
              f.allowedFinish == t.f.occupant && f.allowedFinish != f.occupant
          )
      )
      .map((t) => {
        return {
          f: t.f,
          path: this.calculatedDistances[t.idx][
            Math.max(
              ...fields
                .map((f, idx) => {
                  return { f, idx };
                })
                .filter(
                  (tprim) =>
                    tprim.f.allowedFinish == t.f.occupant &&
                    tprim.f.allowedFinish != tprim.f.occupant
                )
                .map((t) => t.idx)
            )
          ],
        };
      });

    var baseCosts = paths.map(({ f, path }) => {
      return this.costs[f.occupant!] * path.length;
    });

    var occupiedCosts = paths
      .map(({ f, path }) => {
        return path
          .filter(
            (idx) => fields[idx].occupant && fields[idx].occupant != f.occupant
          )
          .map((idx) => this.costs[fields[idx].allowedFinish ?? f.occupant!]);
      })
      .flat();

    // var blockedPathsCosts =

    // console.log(this.printState(fields), paths, baseCosts, occupiedCosts);
    // var result = costs.length > 0 ? costs.reduce((a, b) => a + b) : 0;
    // var result = baseCosts.length > 0 ? baseCosts.reduce((a, b) => a + b) : 0;
    // + (occupiedCosts.length > 0 ? occupiedCosts.reduce((a, b) => a + b) : 0);

    var result =
      (baseCosts.length > 0 ? baseCosts.reduce((a, b) => a + b) : 0) +
      (gapsCost.length > 0 ? gapsCost.reduce((a, b) => a + b) : 0) +
      (occupiedCosts.length > 0 ? occupiedCosts.reduce((a, b) => a + b) : 0) +
      (wrongFinishesCost.length > 0
        ? wrongFinishesCost.reduce((a, b) => a + b)
        : 0) +
      corridorsCost;
    //   (wrongFinishesCost.length > 0
    //     ? wrongFinishesCost.reduce((a, b) => a + b)
    //     : 0) +
    //   (blockedFinishesCost.length > 0
    //     ? blockedFinishesCost.reduce((a, b) => a + b)
    //     : 0);
    this.heuristicCache[key] = result;
    return result;
  }

  // Modified from day 15
  // https://www.algorithms-and-technologies.com/a_star/javascript
  aStar(
    fields: Field[],
    neighbours: { [id: number]: number[] },
    printProgress: number = -1
  ): {
    dist: number[];
    parents: (number | undefined)[];
    states: Field[][];
    finalStateIdx: number;
  } {
    var states = [this.copyFields(fields)];
    var statesCache = [JSON.stringify(fields)];
    //This contains the distances from the start node to all other nodes
    var distances = [Number.MAX_VALUE];
    //This contains the priorities with which to visit the nodes, calculated using the heuristic.
    var priorities = [Number.MAX_VALUE];
    //This contains whether a node was already visited
    var visited = [false];
    var totalVisited = 0;
    //This contains parents a node was already visited
    var parents: (number | undefined)[] = [undefined];

    //The distance from the start node to itself is of course 0
    distances[0] = 0;
    //start node has a priority equal to straight line distance to goal. It will be the first to be expanded.
    priorities[0] = this.heuristic(states[0], neighbours);

    var counter = 0;
    //While there are nodes left to visit...
    while (true) {
      // ... find the node with the currently lowest priority...
      var lowestPriority = Number.MAX_VALUE;
      var lowestPriorityIndex = -1;
      for (var i = 0; i < priorities.length; i++) {
        //... by going through all nodes that haven't been visited yet
        if (priorities[i] < lowestPriority && !visited[i]) {
          lowestPriority = priorities[i];
          lowestPriorityIndex = i;
        }
      }

      if (lowestPriorityIndex === -1) {
        // There was no node not yet visited --> Node not found
        return { dist: [-1], parents: [-1], states, finalStateIdx: -1 };
      } else if (this.isFinished(states[lowestPriorityIndex])) {
        // Goal node found
        return {
          dist: distances,
          parents,
          states,
          finalStateIdx: lowestPriorityIndex,
        };
      }

      //...then, for all neighboring nodes that haven't been visited yet....
      this.validMoves(states[lowestPriorityIndex], neighbours).forEach(
        ([nextState, moveCost]) => {
          var nextStateKey = JSON.stringify(nextState);
          if (!statesCache.includes(nextStateKey)) {
            statesCache.push(nextStateKey);
            states.push(this.copyFields(nextState));
            distances.push(Number.MAX_VALUE);
            priorities.push(Number.MAX_VALUE);
            visited.push(false);
            parents.push(undefined);
          }

          var neighbourIdx = statesCache.indexOf(nextStateKey);
          if (!visited[neighbourIdx]) {
            //...if the path over this edge is shorter...
            if (
              distances[lowestPriorityIndex] + moveCost <
              distances[neighbourIdx]
            ) {
              //...save this path as new shortest path
              distances[neighbourIdx] =
                distances[lowestPriorityIndex] + moveCost;
              //...and set the priority with which we should continue with this node
              priorities[neighbourIdx] =
                distances[neighbourIdx] + this.heuristic(nextState, neighbours);
              parents[neighbourIdx] = lowestPriorityIndex;
            }
          }
        }
      );
      // Lastly, note that we are finished with this node.
      visited[lowestPriorityIndex] = true;
      totalVisited++;

      if (counter % printProgress == 0) {
        console.log(
          counter,
          'states:',
          states.length,
          'idx:',
          lowestPriorityIndex,
          'prio:',
          priorities[lowestPriorityIndex],
          'dist:',
          distances[lowestPriorityIndex],
          'vis%:',
          Math.round((totalVisited * 100) / states.length),
          this.printState(states[lowestPriorityIndex])
        );
      }
      counter++;
    }
  }

  private calculateCosts(positions: Point2D[]) {
    positions.forEach((pos, posIdx) => {
      this.calculatedCosts[posIdx] = {};
      this.positions.forEach(([char, finalX]) => {
        var xDiff = Math.abs(pos.x - finalX);
        this.calculatedCosts[posIdx][char] =
          xDiff > 0 || pos.y == 1
            ? (xDiff + (pos.y - 1) + 2) * this.costs[char]
            : 0;
      });
    });
  }

  private calculateDistances(
    fields: Field[],
    neighbours: { [id: number]: number[] }
  ) {
    function explorePaths(
      fieldIdx: number,
      previousFieldIdx: number
    ): number[][] {
      var result: number[][] = [];
      neighbours[fieldIdx]
        .filter((nIdx) => nIdx != previousFieldIdx)
        .forEach((nIdx) => {
          var path = [nIdx];
          result.push(path);
          explorePaths(nIdx, fieldIdx).forEach((deepPath) => {
            result.push(path.concat(deepPath));
          });
        });
      // console.log(result);
      return result;
    }
    fields.forEach((field, fieldIdx) => {
      this.calculatedDistances[fieldIdx] = {};
      explorePaths(fieldIdx, -1).forEach((path) => {
        // console.log(fieldIdx, path);
        var endIdx = path.slice(-1)[0];
        var cutPath = path.slice(0, path.length - 1);
        // console.log(fieldIdx, cutPath, endIdx);
        if (!(fieldIdx in this.calculatedDistances)) {
          this.calculatedDistances[fieldIdx] = {};
        }
        if (!(endIdx in this.calculatedDistances)) {
          this.calculatedDistances[endIdx] = {};
        }
        this.calculatedDistances[fieldIdx][endIdx] = [...cutPath].concat([
          endIdx,
        ]);
        this.calculatedDistances[endIdx][fieldIdx] = cutPath
          .reverse()
          .concat([fieldIdx]);
      });
    });
  }

  private generateHash(
    fieldIdx: number,
    fields: Field[],
    neighbours: { [id: number]: number[] }
  ): string {
    var field = fields[fieldIdx];
    var freeIdxs: number[] = [];
    var nextNeighbours = [...neighbours[fieldIdx]];
    while (nextNeighbours.length > 0) {
      var tempNextNeighbours: number[] = [];
      nextNeighbours.forEach((nIdx) => {
        if (
          !fields[nIdx].occupant
          // &&
          // (!fields[nIdx].allowedFinish ||
          //   fields[nIdx].allowedFinish == field.occupant)
        ) {
          freeIdxs.push(nIdx);
          neighbours[nIdx]
            .filter((nPrim) => !freeIdxs.includes(nPrim))
            .forEach((nPrim) => {
              tempNextNeighbours.push(nPrim);
            });
        }
      });
      nextNeighbours = tempNextNeighbours;
    }
    var alteredFields = fields.map((f, idx) => {
      return {
        f,
        letter:
          idx == fieldIdx
            ? f.occupant!
            : freeIdxs.includes(idx)
            ? ' '
            : fields[idx].occupant == field.occupant
            ? f.occupant!.toLowerCase()
            : 'X',
      };
    });
    // return alteredFields.map(({ f, letter }) => letter).join('');
    var lane = alteredFields
      .filter(({ f, letter }) => !f.allowedFinish)
      .map(({ f, letter }) => letter)
      .join('');
    var roomA = alteredFields
      .filter(({ f, letter }) => f.allowedFinish == 'A')
      .map(({ f, letter }) => letter)
      .join('');
    var roomB = alteredFields
      .filter(({ f, letter }) => f.allowedFinish == 'B')
      .map(({ f, letter }) => letter)
      .join('');
    var roomC = alteredFields
      .filter(({ f, letter }) => f.allowedFinish == 'C')
      .map(({ f, letter }) => letter)
      .join('');
    var roomD = alteredFields
      .filter(({ f, letter }) => f.allowedFinish == 'D')
      .map(({ f, letter }) => letter)
      .join('');
    return `(${lane})[${roomA}][${roomB}][${roomC}][${roomD}]`;
  }

  private printState(fields: Field[]): string {
    var lane = fields
      .filter((f) => !f.allowedFinish)
      .map((f) => f.occupant ?? (f.allowedStop ? ' ' : '.'))
      .join('');
    var roomA = fields
      .filter((f) => f.allowedFinish == 'A')
      .map((f) => f.occupant ?? ' ')
      .join('');
    var roomB = fields
      .filter((f) => f.allowedFinish == 'B')
      .map((f) => f.occupant ?? ' ')
      .join('');
    var roomC = fields
      .filter((f) => f.allowedFinish == 'C')
      .map((f) => f.occupant ?? ' ')
      .join('');
    var roomD = fields
      .filter((f) => f.allowedFinish == 'D')
      .map((f) => f.occupant ?? ' ')
      .join('');
    return `(${lane})[${roomA}][${roomB}][${roomC}][${roomD}]`;
  }

  override solvePart1(input: string): PuzzleResult {
    var lines = splitIntoLines(input);
    var [fields, positions] = this.parseInput(lines);
    var neighbours = this.getNeighbourhoods(positions);
    this.calculateCosts(positions);
    this.calculateDistances(fields, neighbours);
    // console.log(this.calculatedDistances);
    // console.log(this.calculatedCosts);
    // console.log(this.printState(fields), this.heuristic(fields, neighbours));
    // console.log(fields, neighbours);
    // console.log(this.printState(fields));
    // console.log(this.calculatedDistances);
    // console.log(this.heuristic(fields));
    // console.log(this.validMoves(fields, neighbours));
    // console.log(this.movesCache);

    var { dist, parents, states, finalStateIdx } = this.aStar(
      fields,
      neighbours,
      1
    );
    var path = [finalStateIdx];
    while (path[path.length - 1] !== undefined && path[path.length - 1] != 0) {
      path.push(parents[path[path.length - 1]]!);
    }
    path.reverse();
    console.log(finalStateIdx, path);
    path.forEach((p) => {
      console.log(this.printState(states[p]), dist[p]);
    });
    return {
      result: dist[finalStateIdx],
      // result: 0,
      component: PlotlyGraphComponent,
      componentData: {},
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var lines = splitIntoLines(input);
    lines.splice(3, 0, '  #D#C#B#A#');
    lines.splice(4, 0, '  #D#B#A#C#');
    var [fields, positions] = this.parseInput(lines);
    var neighbours = this.getNeighbourhoods(positions);
    // console.log(this.printState(fields));
    this.calculateCosts(positions);
    this.calculateDistances(fields, neighbours);
    // console.log(this.calculatedDistances);
    // console.log(this.calculatedCosts);
    // console.log(fields, neighbours);
    // console.log(this.printState(fields));
    // console.log(this.printState(fields), this.heuristic(fields, neighbours));
    // console.log(this.validMoves(fields, neighbours));
    // console.log(this.movesCache);
    // this.validMoves(fields, neighbours).forEach((t) => {
    //   console.log(this.printState(t[0]), this.heuristic(t[0], neighbours));
    // });

    var { dist, parents, states, finalStateIdx } = this.aStar(
      fields,
      neighbours,
      100
    );
    console.log(dist, parents, states, finalStateIdx);
    var path = [finalStateIdx];
    while (path[path.length - 1] !== undefined && path[path.length - 1] != 0) {
      path.push(parents[path[path.length - 1]]!);
    }
    path.reverse();
    console.log(path);
    path.forEach((p) => console.log(this.printState(states[p])));
    return {
      result: dist[finalStateIdx],
      // result: 0,
      component: PlotlyGraphComponent,
      componentData: {},
    };
  }
}
