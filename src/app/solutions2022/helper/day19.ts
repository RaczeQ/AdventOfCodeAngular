export type Material = 'ore' | 'clay' | 'obsidian' | 'geode';

export interface Robot {
  material: Material;
  state: 'building' | 'working';
  minutesWorked: number;
}

export interface BuildingRecipe {
  cost: Map<Material, number>;
  material: Material;
}

export interface Blueprint {
  id: number;
  recipes: BuildingRecipe[];
}

interface MaterialsCache {
  materials: Map<Material, number>;
  robots: Robot[];
}

function calculatePotentialBestGeodes(
  materials: Map<Material, number>,
  robots: Robot[],
  minutesLeft: number
) {
  return (
    materials!.get('geode')! +
    robots.filter(
      (robot) => robot.material === 'geode' && robot.state === 'working'
    ).length *
      minutesLeft +
    robots.filter(
      (robot) => robot.material === 'geode' && robot.state === 'building'
    ).length *
      (minutesLeft - 1) +
    Array.range(1, minutesLeft).sum()
  );
}

function collectResources(
  minutes: number,
  robots: Robot[],
  materials: Map<Material, number>
) {
  if (minutes > 0) {
    // Move robots
    robots
      .filter((robot) => robot.state === 'working')
      .forEach((robot, idx) => {
        materials.set(
          robot.material,
          materials!.get(robot.material)! + minutes
        );
      });

    // Finish building robots
    robots
      .filter((robot) => robot.state === 'building')
      .forEach((robot, idx) => {
        materials!.set(
          robot.material,
          materials.get(robot.material)! + minutes - 1
        );
        robot.state = 'working';
      });
  }
}

export function evaluateBlueprint(
  blueprint: Blueprint,
  minutesLeft: number,
  robots: Robot[],
  materials?: Map<Material, number>,
  maxCosts?: Map<Material, number>,
  cache?: MaterialsCache
): { materials: Map<Material, number>; robots: Robot[] } {
  if (materials === undefined) {
    materials = new Map<Material, number>([
      ['ore', 0],
      ['clay', 0],
      ['obsidian', 0],
      ['geode', 0],
    ]);
  }
  if (maxCosts === undefined) {
    maxCosts = new Map<Material, number>(
      (['ore', 'clay', 'obsidian'] as Material[]).map((material) => [
        material,
        Math.max(
          ...blueprint.recipes
            .filter((recipe) => recipe.cost.has(material))
            .map((recipe) => recipe.cost.get(material)!)
        ),
      ])
    );
    maxCosts.set('geode', Infinity);
  }
  if (cache === undefined) {
    cache = {
      materials: new Map<Material, number>([
        ['ore', 0],
        ['clay', 0],
        ['obsidian', 0],
        ['geode', 0],
      ]),
      robots: robots,
    };
  }

  if (minutesLeft == 0) {
    return { materials, robots };
  }

  var potentialBestGeodes = calculatePotentialBestGeodes(
    materials!,
    robots,
    minutesLeft
  );
  if (potentialBestGeodes <= cache.materials.get('geode')!) {
    return { materials, robots };
  }

  // Disallow multiple robots building
  if (robots.some((robot) => robot.state === 'building')) {
    collectResources(1, robots, materials);
    return evaluateBlueprint(
      blueprint,
      minutesLeft - 1,
      robots,
      materials,
      maxCosts,
      cache
    );
  }

  var availableMoves = blueprint.recipes
    .filter(
      (recipe) =>
        // Exists robot for each of materials
        Array.from(recipe.cost.keys()).every((material) =>
          robots.some((robot) => robot.material === material)
        ) &&
        // Don't build if have enough robots to collect it daily
        robots.filter((robot) => robot.material === recipe.material).length <
          maxCosts!.get(recipe.material)! &&
        // Make it better - https://www.reddit.com/r/adventofcode/comments/zpy5rm/2022_day_19_what_are_your_insights_and/
        // if you already have X robots creating resource R,
        // a current stock of Y for that resource, T minutes left,
        // and no robot requires more than Z of resource R to build,
        // and X * T+Y >= T * Z, then you never need to build
        // another robot mining R anymore.
        robots.filter((robot) => robot.material === recipe.material).length *
          minutesLeft +
          materials!.get(recipe.material)! <
          maxCosts!.get(recipe.material)! * minutesLeft
    )
    .map((recipe) => {
      // Calculate missing materials
      var missingMaterials = new Map(
        Array.from(recipe.cost.entries()).map(([material, value]) => [
          material,
          Math.max(0, value - materials!.get(material)!),
        ])
      );
      // Find required time to wait
      var minutesToWait = Math.max(
        ...Array.from(missingMaterials.entries()).map(([material, value]) =>
          Math.ceil(
            value / robots.filter((robot) => robot.material === material).length
          )
        )
      );
      return {
        minutesToWait,
        recipe,
      };
    })
    // Return only moves where we have time to execute them
    .filter(
      ({ minutesToWait, recipe }) =>
        minutesToWait < minutesLeft && minutesLeft - minutesToWait > 1
    );

  if (availableMoves.length > 0) {
    for (let index = 0; index < availableMoves.length; index++) {
      const { minutesToWait, recipe } = availableMoves[index];
      var robotsCopy = Object.assign([], robots);
      var materialsCopy = new Map(materials);

      collectResources(minutesToWait, robotsCopy, materialsCopy);

      recipe.cost.forEach((value, material) => {
        materialsCopy.set(material, materialsCopy.get(material)! - value);
      });
      robotsCopy.push({
        state: 'building',
        material: recipe.material,
        minutesWorked: minutesLeft - minutesToWait - 1,
      });

      var recursiveEvaluation = evaluateBlueprint(
        blueprint,
        minutesLeft - minutesToWait,
        robotsCopy,
        materialsCopy,
        maxCosts,
        cache
      );
      var potentialBestMaterials = recursiveEvaluation.materials;
      if (
        potentialBestMaterials.get('geode')! > cache.materials.get('geode')!
      ) {
        cache.materials = potentialBestMaterials;
        cache.robots = recursiveEvaluation.robots;
      }
    }
    return cache;
  }

  collectResources(minutesLeft, robots, materials);
  return { materials, robots };
}
