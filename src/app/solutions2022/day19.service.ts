import { Injectable } from '@angular/core';
import { PlotlyGraphComponent } from '../helper/components/plotly-graph/plotly-graph.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';
import { Blueprint, Material, Robot } from './helper/day19';

function parseBlueprints(input: string): Blueprint[] {
  return splitIntoLines(input, true).map((line) => {
    var matches = Array.from(
      line.matchAll(
        /Blueprint (\d+): Each ore robot costs (\d+) ore. Each clay robot costs (\d+) ore. Each obsidian robot costs (\d+) ore and (\d+) clay. Each geode robot costs (\d+) ore and (\d+) obsidian./gm
      )
    )[0];
    var oreRobotOreCost = Number(matches[2]);
    var clayRobotOreCost = Number(matches[3]);
    var obsidianRobotOreCost = Number(matches[4]);
    var obsidianRobotClayCost = Number(matches[5]);
    var geodeRobotOreCost = Number(matches[6]);
    var geodeRobotObsidianCost = Number(matches[7]);
    return {
      id: Number(matches[1]),
      recipes: [
        {
          material: 'geode',
          cost: new Map<Material, number>([
            ['ore', geodeRobotOreCost],
            ['obsidian', geodeRobotObsidianCost],
          ]),
        },
        {
          material: 'obsidian',
          cost: new Map<Material, number>([
            ['ore', obsidianRobotOreCost],
            ['clay', obsidianRobotClayCost],
          ]),
        },
        {
          material: 'ore',
          cost: new Map<Material, number>([['ore', oreRobotOreCost]]),
        },
        {
          material: 'clay',
          cost: new Map<Material, number>([['ore', clayRobotOreCost]]),
        },
      ],
    };
  });
}

async function solveMultithreaded(
  blueprints: Blueprint[],
  minutes: number
): Promise<
  { blueprint: Blueprint; materials: Map<Material, number>; robots: Robot[] }[]
> {
  var startingState: Robot[] = [
    { material: 'ore', state: 'working', minutesWorked: minutes },
  ];
  var evaluatedBlueprints: {
    blueprint: Blueprint;
    materials: Map<Material, number>;
    robots: Robot[];
  }[] = [];
  blueprints.forEach((blueprint) => {
    const worker = new Worker(
      new URL('./web-workers/day19.worker', import.meta.url)
    );

    worker.onmessage = ({ data }) => {
      var blueprint = data.blueprint as Blueprint;
      var materials = data.materials as Map<Material, number>;
      var robots = data.robots as Robot[];
      evaluatedBlueprints.push({ blueprint, materials, robots });
      console.log('Evaluated blueprints:', evaluatedBlueprints.length);
    };

    worker.postMessage([blueprint, minutes, startingState]);
  });
  while (evaluatedBlueprints.length < blueprints.length) {
    await new Promise((r) => setTimeout(r, 10));
  }
  return evaluatedBlueprints.sort((a, b) => a.blueprint.id - b.blueprint.id);
}

function retraceBlueprintMoves(
  blueprint: Blueprint,
  minutes: number,
  robots: Robot[]
): {
  minute: number;
  materials: Map<Material, number>;
  workingRobots: Map<Material, number>;
}[] {
  var workingRobots = new Map<Material, number>([
    ['ore', 0],
    ['clay', 0],
    ['obsidian', 0],
    ['geode', 0],
  ]);
  var materials = new Map<Material, number>([
    ['ore', 0],
    ['clay', 0],
    ['obsidian', 0],
    ['geode', 0],
  ]);
  var result: {
    minute: number;
    materials: Map<Material, number>;
    workingRobots: Map<Material, number>;
  }[] = [];
  Array.range(0, minutes + 1).forEach((minute) => {
    var currentMinute = minutes - minute;
    // Collect materials
    Array.from(workingRobots.entries()).forEach(([material, value]) => {
      materials.set(material, materials.get(material)! + value);
    });
    // Add robots
    var currentNewRobot = robots.find(
      (robot) => robot.minutesWorked === currentMinute
    );
    if (currentNewRobot !== undefined) {
      workingRobots.set(
        currentNewRobot.material,
        workingRobots.get(currentNewRobot.material)! + 1
      );
      // Remove materials
      if (minute > 0) {
        Array.from(
          blueprint.recipes.find(
            (recipe) => recipe.material === currentNewRobot!.material
          )!.cost
        ).forEach(([material, value]) => {
          materials.set(material, materials.get(material)! - value);
        });
      }
    }

    result.push({
      minute,
      materials: new Map(materials),
      workingRobots: new Map(workingRobots),
    });
  });

  return result;
}

function getMaterialColor(material: Material): string {
  switch (material) {
    case 'geode':
      return '#fad02c';
    case 'clay':
      return '#d5a372';
    case 'ore':
      return '#a90e0e';
    case 'obsidian':
      return '#3d2856';
  }
}

function calculatePlotlyData(evaluations: any[], minutes: number): any {
  var retracedBlueprintsEvaluations = evaluations.map((evaluation) =>
    retraceBlueprintMoves(evaluation.blueprint, minutes, evaluation.robots)
  );
  var graphLayout: any = {
    height: 400 * evaluations.length,
    grid: {
      rows: evaluations.length,
      columns: 1,
      pattern: 'independent',
      subplots: Array.range(0, evaluations.length).map((row) => [
        // `xy${row === 0 ? '' : row + 1}`,
        `x${row === 0 ? '' : row + 1}y${row === 0 ? '' : row + 1}`,
      ]),
    },
  };
  Array.range(0, evaluations.length).forEach((row) => {
    var currentXaxis = `xaxis${row === 0 ? '' : row + 1}`;
    var currentYaxis = `yaxis${row === 0 ? '' : row + 1}`;
    if (!graphLayout[currentXaxis]) {
      graphLayout[currentXaxis] = {};
    }
    var geodesCollected =
      retracedBlueprintsEvaluations[row][
        retracedBlueprintsEvaluations[row].length - 1
      ].materials.get('geode');
    graphLayout[
      currentXaxis
    ].title = `Minute (Blueprint: ${evaluations[row].blueprint.id}, Total geodes: ${geodesCollected})`;
    graphLayout[currentXaxis].automargin = true;
    graphLayout[currentXaxis].showgrid = false;
    graphLayout[currentXaxis].zeroline = false;
    graphLayout[currentXaxis].showline = true;
    graphLayout[currentXaxis].color = '#ffffff';
    graphLayout[currentXaxis].tickfont = {
      color: '#ffffff',
    };

    if (!graphLayout[currentYaxis]) {
      graphLayout[currentYaxis] = {};
    }
    graphLayout[currentYaxis].title = `Amount`;
    graphLayout[currentYaxis].showgrid = false;
    graphLayout[currentYaxis].showline = true;
    graphLayout[currentYaxis].zeroline = false;
    graphLayout[currentYaxis].color = '#ffffff';
    graphLayout[currentYaxis].tickfont = {
      color: '#ffffff',
    };
  });

  return {
    graphData: retracedBlueprintsEvaluations.flatMap((evaluation, idx) =>
      (['ore', 'clay', 'obsidian', 'geode'] as Material[]).map((material) => {
        return {
          x: evaluation.map((state) => state.minute),
          y: evaluation.map((state) => state.materials.get(material)),
          type: 'scatter',
          xaxis: `x${idx === 0 ? '' : idx + 1}`,
          yaxis: `y${idx === 0 ? '' : idx + 1}`,
          line: { shape: 'hv' },
          mode: 'lines+markers',
          name: material,
          marker: { color: getMaterialColor(material) },
          showlegend: idx === 0,
        };
      })
    ),
    graphLayout,
  };
}

@Injectable({
  providedIn: 'root',
})
export class Day19Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2022, 19, 'Not Enough Minerals');
  }
  override async solvePart1(input: string): Promise<PuzzleResult> {
    var blueprints = parseBlueprints(input);
    var evaluations = await (
      await solveMultithreaded(blueprints, 24)
    ).filter((evaluation) => evaluation.materials.get('geode')! > 0);
    var result = evaluations
      .map(
        (evaluation, id) =>
          evaluation.materials.get('geode')! * evaluation.blueprint.id
      )
      .sum();

    return {
      result: result,
      component: PlotlyGraphComponent,
      componentData: calculatePlotlyData(evaluations, 24),
    };
  }
  override async solvePart2(input: string): Promise<PuzzleResult> {
    var blueprints = parseBlueprints(input);
    var evaluations = await solveMultithreaded(blueprints.slice(0, 3), 32);
    var result = evaluations
      .map((evaluation, id) => evaluation.materials.get('geode')!)
      .product();
    return {
      result: result,
      component: PlotlyGraphComponent,
      componentData: calculatePlotlyData(evaluations, 32),
    };
  }
}
