import { Injectable } from '@angular/core';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { Point2D } from '../helper/util-functions/point';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';
import { AmphipodsRoomVisualizerComponent } from './components/amphipods-room-visualizer/amphipods-room-visualizer.component';

export interface AmphipodRoomField {
  allowedStop: boolean;
  allowedFinish?: string;
  occupant?: string;
  position: Point2D;
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

  private calculatedPaths: {
    [startIdx: number]: { [destIdx: number]: number[] };
  } = {};

  private parseInput(lines: string[]): [AmphipodRoomField[], Point2D[]] {
    var fields: AmphipodRoomField[] = [];
    var border: Point2D[] = [];
    lines.forEach((line, y) => {
      line.split('').forEach((char, x) => {
        if (char.trim() != '') {
          if (char == '#') {
            border.push({ x, y });
          } else {
            var field: AmphipodRoomField = {
              position: { x, y },
              allowedStop: !(y > 1 || [3, 5, 7, 9].includes(x)),
            };
            if (char != '.') {
              field.occupant = char;
            }
            if (y > 1) {
              field.allowedFinish = this.positions.find(
                (pos) => pos[1] == x
              )![0];
            }
            fields.push(field);
          }
        }
      });
    });
    return [fields, border];
  }

  private getNeighbourhoods(fields: AmphipodRoomField[]): {
    [id: number]: number[];
  } {
    var result: { [id: number]: number[] } = {};
    fields.forEach((field, idx) => {
      var up = fields.findIndex(
        (f) =>
          f.position.x == field.position.x &&
          f.position.y == field.position.y - 1
      );
      var left = fields.findIndex(
        (f) =>
          f.position.x == field.position.x - 1 &&
          f.position.y == field.position.y
      );
      var right = fields.findIndex(
        (f) =>
          f.position.x == field.position.x + 1 &&
          f.position.y == field.position.y
      );
      var down = fields.findIndex(
        (f) =>
          f.position.x == field.position.x &&
          f.position.y == field.position.y + 1
      );
      result[idx] = [up, left, right, down].filter((f) => f > -1);
    });
    return result;
  }

  private copyFields(fields: AmphipodRoomField[]): AmphipodRoomField[] {
    var result = fields.map((f) => Object.assign({}, f));
    return result;
  }

  private swapPositions(
    fields: AmphipodRoomField[],
    startIdx: number,
    endIdx: number
  ): AmphipodRoomField[] {
    var result = this.copyFields(fields);
    result[startIdx].occupant = fields[endIdx].occupant;
    result[endIdx].occupant = fields[startIdx].occupant;
    return result;
  }

  private checkIfIsSettled(
    fieldIdx: number,
    fields: AmphipodRoomField[],
    neighbours: { [id: number]: number[] },
    withStart: boolean = true
  ): boolean {
    var currentIdx = fieldIdx;
    var laneFields = [];
    if (withStart) {
      laneFields.push(fields[currentIdx]);
    }
    while (Math.max(...neighbours[currentIdx]) > currentIdx) {
      currentIdx = Math.max(...neighbours[currentIdx]);
      laneFields.push(fields[currentIdx]);
    }
    var result =
      laneFields.length == 0 ||
      laneFields.every((f) => f.allowedFinish && f.occupant == f.allowedFinish);
    return result;
  }

  private generateAllPaths(
    fieldIdx: number,
    fields: AmphipodRoomField[],
    neighbours: { [id: number]: number[] }
  ): { destIdx: number; dist: number }[] {
    var result: { destIdx: number; dist: number }[] = [];
    var currentField = fields[fieldIdx];
    // Paths from room to corridor
    if (
      currentField.allowedFinish &&
      !this.checkIfIsSettled(fieldIdx, fields, neighbours, true)
    ) {
      fields.forEach((f, destIdx) => {
        if (fieldIdx != destIdx && !f.occupant) {
          var path = this.calculatedPaths[fieldIdx][destIdx];
          if (f.allowedStop && path.every((pIdx) => !fields[pIdx].occupant)) {
            result.push({ destIdx, dist: path.length });
          }
        }
      });
      // Paths from corridor to room
    } else if (!currentField.allowedFinish) {
      fields.forEach((f, destIdx) => {
        if (fieldIdx != destIdx && !f.occupant) {
          var path = this.calculatedPaths[fieldIdx][destIdx];
          if (
            f.allowedFinish &&
            f.allowedFinish == currentField.occupant &&
            this.checkIfIsSettled(destIdx, fields, neighbours, false) &&
            path.every((pIdx) => !fields[pIdx].occupant)
          ) {
            result.push({ destIdx, dist: path.length });
          }
        }
      });
    }
    return result;
  }

  private validMoves(
    fields: AmphipodRoomField[],
    neighbours: { [id: number]: number[] }
  ): [AmphipodRoomField[], number][] {
    var result: [AmphipodRoomField[], number][] = [];
    fields.forEach((field, fieldIdx) => {
      if (field.occupant) {
        var subResult: [AmphipodRoomField[], number][] = [];
        var paths = this.generateAllPaths(fieldIdx, fields, neighbours);
        paths.forEach(({ destIdx, dist }) => {
          subResult.push([
            this.swapPositions(fields, fieldIdx, destIdx),
            dist * this.costs[field.occupant!],
          ]);
        });
        result.push(...subResult);
      }
    });
    return result;
  }

  private isFinished(fields: AmphipodRoomField[]): boolean {
    var result = fields.every(
      (f) => !f.allowedFinish || f.allowedFinish == f.occupant
    );
    return result;
  }

  private heuristicCache: { [key: string]: number } = {};

  private heuristic(fields: AmphipodRoomField[]): number {
    var key = this.printState(fields);
    if (key in this.heuristicCache) {
      return this.heuristicCache[key];
    }

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
          path: this.calculatedPaths[t.idx][
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

    var result = baseCosts.length > 0 ? baseCosts.reduce((a, b) => a + b) : 0;
    this.heuristicCache[key] = result;
    return result;
  }

  // Modified from day 15
  // https://www.algorithms-and-technologies.com/a_star/javascript
  aStar(
    fields: AmphipodRoomField[],
    neighbours: { [id: number]: number[] },
    printProgress: number = -1
  ): {
    dist: number[];
    parents: (number | undefined)[];
    states: AmphipodRoomField[][];
    finalStateIdx: number;
    bestDistances: number[];
    bestPriorities: number[];
    totalStates: number[];
    totalStatesVisited: number[];
  } {
    var states = new Map<number, AmphipodRoomField[]>();
    var statesCache = new Map<string, number>();
    var distances = new Map<number, number>();
    var priorities = new Map<number, number>();
    var nonVisitedIdxsSortedByPriorities = new Array<number>();
    var parents = new Map<number, number | undefined>();
    var nonVisited = new Set<number>();

    function sortedIndex(array: number[], value: number) {
      var low = 0,
        high = array.length;

      while (low < high) {
        var mid = (low + high) >>> 1;
        if (priorities.get(array[mid])! <= value) low = mid + 1;
        else high = mid;
      }
      return low;
    }

    states.set(0, this.copyFields(fields));
    statesCache.set(this.printState(fields), 0);
    distances.set(0, 0);
    priorities.set(0, this.heuristic(states.get(0)!));
    nonVisitedIdxsSortedByPriorities.push(0);
    parents.set(0, undefined);
    nonVisited.add(0);
    var bestDistances: number[] = [];
    var bestPriorities: number[] = [];
    var totalStates: number[] = [];
    var totalStatesVisited: number[] = [];
    var totalVisited = 0;

    var nextIdx = 1;
    // While there are nodes left to visit...
    while (true) {
      // ... find the node with the currently lowest priority...
      var lowestPriorityIndex = -1;
      if (nonVisited.size > 0) {
        lowestPriorityIndex = nonVisitedIdxsSortedByPriorities[0];
      }

      bestDistances.push(distances.get(lowestPriorityIndex)!);
      bestPriorities.push(priorities.get(lowestPriorityIndex)!);
      totalStates.push(states.size);
      totalStatesVisited.push(totalVisited);

      if (lowestPriorityIndex === -1) {
        // There was no node not yet visited --> Node not found
        return {
          dist: [-1],
          parents: [-1],
          states: [...states.keys()].map((k) => states.get(k)!),
          finalStateIdx: -1,
          bestDistances,
          bestPriorities,
          totalStates,
          totalStatesVisited,
        };
      } else if (this.isFinished(states.get(lowestPriorityIndex)!)) {
        // Goal node found
        return {
          dist: [...distances.keys()].map((k) => distances.get(k)!),
          parents: [...parents.keys()].map((k) => parents.get(k)!),
          states: [...states.keys()].map((k) => states.get(k)!),
          finalStateIdx: lowestPriorityIndex,
          bestDistances,
          bestPriorities,
          totalStates,
          totalStatesVisited,
        };
      }

      //...then, for all neighboring nodes that haven't been visited yet....
      this.validMoves(states.get(lowestPriorityIndex)!, neighbours).forEach(
        ([nextState, moveCost]) => {
          var nextStateKey = this.printState(nextState);
          if (!statesCache.has(nextStateKey)) {
            statesCache.set(nextStateKey, nextIdx);
            states.set(nextIdx, this.copyFields(nextState));
            distances.set(nextIdx, Number.MAX_VALUE);
            priorities.set(nextIdx, Number.MAX_VALUE);
            nonVisitedIdxsSortedByPriorities.push(nextIdx);
            nonVisited.add(nextIdx);
            parents.set(nextIdx, undefined);
            nextIdx++;
          }

          var neighbourIdx = statesCache.get(nextStateKey)!;
          // if (!visited.get(neighbourIdx)) {
          if (nonVisited.has(neighbourIdx)) {
            //...if the path over this edge is shorter...
            if (
              distances.get(lowestPriorityIndex)! + moveCost <
              distances.get(neighbourIdx)!
            ) {
              //...save this path as new shortest path
              distances.set(
                neighbourIdx,
                distances.get(lowestPriorityIndex)! + moveCost
              );
              //...and set the priority with which we should continue with this node
              priorities.set(
                neighbourIdx,
                distances.get(neighbourIdx)! + this.heuristic(nextState)
              );
              nonVisitedIdxsSortedByPriorities.splice(
                nonVisitedIdxsSortedByPriorities.indexOf(neighbourIdx),
                1
              );
              nonVisitedIdxsSortedByPriorities.splice(
                sortedIndex(
                  nonVisitedIdxsSortedByPriorities,
                  priorities.get(neighbourIdx)!
                ),
                0,
                neighbourIdx
              );
              parents.set(neighbourIdx, lowestPriorityIndex);
            }
          }
        }
      );
      nonVisited.delete(lowestPriorityIndex);
      nonVisitedIdxsSortedByPriorities.splice(
        nonVisitedIdxsSortedByPriorities.indexOf(lowestPriorityIndex),
        1
      );
      totalVisited++;
    }
  }

  private calculatePaths(
    fields: AmphipodRoomField[],
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
      return result;
    }
    fields.forEach((field, fieldIdx) => {
      this.calculatedPaths[fieldIdx] = {};
      explorePaths(fieldIdx, -1).forEach((path) => {
        var endIdx = path.slice(-1)[0];
        var cutPath = path.slice(0, path.length - 1);
        if (!(fieldIdx in this.calculatedPaths)) {
          this.calculatedPaths[fieldIdx] = {};
        }
        if (!(endIdx in this.calculatedPaths)) {
          this.calculatedPaths[endIdx] = {};
        }
        this.calculatedPaths[fieldIdx][endIdx] = [...cutPath].concat([endIdx]);
        this.calculatedPaths[endIdx][fieldIdx] = cutPath
          .reverse()
          .concat([fieldIdx]);
      });
    });
  }

  private printState(fields: AmphipodRoomField[]): string {
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
    var result = `(${lane})[${roomA}][${roomB}][${roomC}][${roomD}]`;
    return result;
  }

  override solvePart1(input: string): PuzzleResult {
    var lines = splitIntoLines(input);
    var [fields, border] = this.parseInput(lines);
    var neighbours = this.getNeighbourhoods(fields);
    this.calculatePaths(fields, neighbours);
    var {
      dist,
      parents,
      states,
      finalStateIdx,
      bestDistances,
      bestPriorities,
      totalStates,
      totalStatesVisited,
    } = this.aStar(fields, neighbours);
    return {
      result: dist[finalStateIdx],
      component: PlotlyGraphComponent,
      componentData: {
        graphData: [
          {
            x: bestDistances.map((v, i) => i),
            y: bestDistances.map((v, i) => v),
            name: 'Current best energy',
          },
          {
            x: bestPriorities.map((v, i) => i),
            y: bestPriorities.map((v, i) => v),
            name: 'Current best heuristic energy',
          },
          {
            x: totalStates.map((v, i) => i),
            y: totalStates.map((v, i) => v),
            name: 'Total states generated',
            yaxis: 'y2',
          },
          {
            x: totalStatesVisited.map((v, i) => i),
            y: totalStatesVisited.map((v, i) => v),
            name: 'Total states visited',
            yaxis: 'y2',
          },
        ],
        graphLayout: {
          yaxis: { title: 'Energy' },
          xaxis: { title: 'Step' },
          yaxis2: {
            title: 'States',
            titlefont: { color: '#ffffff' },
            tickfont: { color: '#ffffff' },
            overlaying: 'y',
            side: 'right',
          },
          shapes: [
            {
              type: 'line',
              x0: 0,
              y0: dist[finalStateIdx],
              x1: bestDistances.length - 1,
              y1: dist[finalStateIdx],
              line: {
                color: '#fad02c',
              },
            },
          ],
        },
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var lines = splitIntoLines(input);
    lines.splice(3, 0, '  #D#C#B#A#');
    lines.splice(4, 0, '  #D#B#A#C#');
    var [fields, border] = this.parseInput(lines);
    var neighbours = this.getNeighbourhoods(fields);
    this.calculatePaths(fields, neighbours);
    var {
      dist,
      parents,
      states,
      finalStateIdx,
      bestDistances,
      bestPriorities,
      totalStates,
      totalStatesVisited,
    } = this.aStar(fields, neighbours);
    var path = [finalStateIdx];
    while (path[path.length - 1] !== undefined && path[path.length - 1] != 0) {
      path.push(parents[path[path.length - 1]]!);
    }
    path.reverse();
    var pathStates = path.map((stateIdx) => states[stateIdx]);
    var costs = path.map((stateIdx) => dist[stateIdx] ?? 0);
    return {
      result: dist[finalStateIdx],
      component: AmphipodsRoomVisualizerComponent,
      componentData: {
        states: pathStates,
        costs: costs,
        border: border,
      },
    };
  }
}
