import { Injectable } from '@angular/core';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';
import { PressureValvesVisualizerComponent } from './components/pressure-valves-visualizer/pressure-valves-visualizer.component';
import { findBestMoves, TunnelConnection, Valves } from './helper/day16';

function parseValves(input: string): Valves {
  var valves: Valves = {};
  splitIntoLines(input, true).forEach((line) => {
    var matches = Array.from(
      line.matchAll(
        /Valve (\w+) has flow rate=(\d+); tunnels? leads? to valves? (.+)/gm
      )
    )[0];
    valves[matches[1]] = {
      flowRate: Number(matches[2]),
      connections: {},
    };
    matches[3].split(', ').forEach((connection) => {
      valves[matches[1]].connections[connection] = {
        distance: 1,
        path: [connection],
      };
    });
  });
  return valves;
}

function generateConnections(
  valves: Valves,
  label: string,
  acc: TunnelConnection = {},
  depth: number = 1
): TunnelConnection {
  var labels = Object.keys(valves);
  var connections = Object.keys(acc);
  if (connections.length == 0) {
    acc = valves[label].connections;
    return generateConnections(valves, label, acc, depth + 1);
  } else {
    if (connections.length === labels.length - 1) {
      return acc!;
    }
    connections.forEach((otherLabel) =>
      Object.keys(valves[otherLabel].connections).forEach((nextDestination) => {
        if (
          valves[otherLabel].connections[nextDestination].distance == 1 &&
          !connections.includes(nextDestination) &&
          nextDestination != label
        ) {
          acc[nextDestination] = {
            distance: depth,
            path: acc[otherLabel].path.concat(...[nextDestination]),
          };
        }
      })
    );
    return generateConnections(valves, label, acc, depth + 1);
  }
}

@Injectable({
  providedIn: 'root',
})
export class Day16Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2022, 16, 'Proboscidea Volcanium');
  }
  override async solvePart1(input: string): Promise<PuzzleResult> {
    var valves = parseValves(input);
    Object.keys(valves).forEach((label) => {
      valves[label].connections = generateConnections(valves, label);
    });

    var moves = await findBestMoves(
      valves,
      [{ currentPosition: 'AA', currentState: 'idle', nextPositions: [] }],
      30
    );

    return {
      result: moves
        .flatMap((moves) => moves)
        .map((move) => move.releasedPressure)
        .sum(),
      component: PressureValvesVisualizerComponent,
      componentData: {
        valves,
        moves,
      },
    };
  }
  override async solvePart2(input: string): Promise<PuzzleResult> {
    var valves = parseValves(input);
    Object.keys(valves).forEach((label) => {
      valves[label].connections = generateConnections(valves, label);
    });

    var moves = await findBestMoves(
      valves,
      [
        { currentPosition: 'AA', currentState: 'idle', nextPositions: [] },
        { currentPosition: 'AA', currentState: 'idle', nextPositions: [] },
      ],
      26
    );

    return {
      result: moves
        .flatMap((moves) => moves)
        .map((move) => move.releasedPressure)
        .sum(),
      component: PressureValvesVisualizerComponent,
      componentData: {
        valves,
        moves,
      },
    };
  }
}
