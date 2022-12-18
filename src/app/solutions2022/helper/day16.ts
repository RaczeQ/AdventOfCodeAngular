export interface TunnelConnection {
  [label: string]: {
    distance: number;
    path: string[];
  };
}

export interface Valves {
  [label: string]: {
    flowRate: number;
    connections: TunnelConnection;
  };
}

interface GlobalCounter {
  value: number;
  higherValue: number;
}

export interface ValveOpenerMove {
  destination: string;
  releasedPressure: number;
  timeLeft: number;
}

export interface ValveOpenerMoveWithPositions extends ValveOpenerMove {
  positions: string[];
}

interface ValveOpener {
  currentPosition: string;
  nextPositions: string[];
  currentState: 'moving' | 'opening' | 'idle';
}

function getNextMoves(
  valves: Valves,
  currentPosition: string,
  openedValves: string[],
  timeLeft: number
): ValveOpenerMoveWithPositions[] {
  return Object.keys(valves[currentPosition].connections)
    .filter(
      (destination) =>
        valves[destination].flowRate > 0 && !openedValves.includes(destination)
    )
    .map((destination) => {
      var timeOpened =
        timeLeft -
        valves[currentPosition].connections[destination].distance -
        1;
      return {
        destination,
        releasedPressure: timeOpened * valves[destination].flowRate,
        timeLeft: timeOpened,
        positions: valves[currentPosition].connections[destination].path,
      };
    })
    .filter((move) => move.timeLeft >= 0)
    .sort((a, b) => b.releasedPressure - a.releasedPressure);
}

export function findBestValveOpeningMoves(
  valves: Valves,
  agents: ValveOpener[],
  timeLeft: number,
  openedValves: string[] = [],
  agg?: ValveOpenerMoveWithPositions[][],
  counter: GlobalCounter = { value: 0, higherValue: 0 }
): ValveOpenerMoveWithPositions[][] {
  counter.value += 1;
  if (agg == undefined) {
    agg = agents.map((agent) => []);
  }

  if (timeLeft == 0) {
    return agg;
  }

  if (counter.value % 1000000 === 0) {
    console.log(new Date().toISOString(), counter.higherValue, counter.value);
  }

  // Changing destinations
  for (let idx = 0; idx < agents.length; idx++) {
    const agent = agents[idx];
    if (agent.currentState == 'idle' || agent.currentState == 'opening') {
      var potentialMoves = getNextMoves(
        valves,
        agent.currentPosition,
        openedValves,
        timeLeft
      );
      for (const move of potentialMoves) {
        var copiedAgents = agents.map((a) => Object.assign({}, a));
        copiedAgents[idx].nextPositions = move.positions;
        copiedAgents[idx].currentState = 'moving';
        if (openedValves.length == 0) {
          counter.higherValue += 1;
        }
        var bestPotentialMoves = findBestValveOpeningMoves(
          valves,
          copiedAgents,
          timeLeft,
          openedValves.concat(...[move.destination]),
          undefined,
          counter
        );
        bestPotentialMoves[idx] = [move].concat(...bestPotentialMoves[idx]);
        if (
          bestPotentialMoves
            .flatMap((moves) => moves)
            .map((move) => move.releasedPressure)
            .sum() >
          agg!
            .flatMap((moves) => moves)
            .map((move) => move.releasedPressure)
            .sum()
        ) {
          agg = bestPotentialMoves;
        }
      }
      return agg;
    }
  }

  // Moving agents
  for (let idx = 0; idx < agents.length; idx++) {
    const agent = agents[idx];
    if (agent.currentState == 'moving') {
      if (agent.nextPositions.length > 0) {
        agent.currentPosition = agent.nextPositions[0];
        agent.nextPositions = agent.nextPositions.slice(1);
      } else {
        agent.currentState = 'opening';
      }
    }
  }

  return findBestValveOpeningMoves(
    valves,
    agents,
    timeLeft - 1,
    openedValves,
    agg,
    counter
  );
}

export async function findBestMoves(
  valves: Valves,
  agents: ValveOpener[],
  timeLeft: number,
  openedValves: string[] = [],
  agg?: ValveOpenerMoveWithPositions[][],
  counter: GlobalCounter = { value: 0, higherValue: 0 }
): Promise<ValveOpenerMoveWithPositions[][]> {
  counter.value += 1;
  if (agg == undefined) {
    agg = agents.map((agent) => []);
  }

  if (timeLeft == 0) {
    return agg;
  }

  if (counter.value % 1000000 === 0) {
    console.log(new Date().toISOString(), counter.higherValue, counter.value);
    await new Promise((r) => setTimeout(r, 1));
  }

  // Changing destinations
  for (let idx = 0; idx < agents.length; idx++) {
    const agent = agents[idx];
    if (agent.currentState == 'idle' || agent.currentState == 'opening') {
      var potentialMoves = getNextMoves(
        valves,
        agent.currentPosition,
        openedValves,
        timeLeft
      );
      if (typeof Worker !== 'undefined') {
        var parsedMoves: ValveOpenerMoveWithPositions[] = [];

        potentialMoves.forEach((move, moveIdx) => {
          var copiedAgents = agents.map((a) => Object.assign({}, a));
          copiedAgents[idx].nextPositions = move.positions;
          copiedAgents[idx].currentState = 'moving';

          const worker = new Worker(
            new URL('../web-workers/day16.worker', import.meta.url)
          );

          worker.onmessage = ({ data }) => {
            var move = data.move as ValveOpenerMoveWithPositions;
            var bestPotentialMoves =
              data.bestPotentialMoves as ValveOpenerMoveWithPositions[][];
            bestPotentialMoves[idx] = [move].concat(...bestPotentialMoves[idx]);
            if (
              bestPotentialMoves
                .flatMap((moves) => moves)
                .map((move) => move.releasedPressure)
                .sum() >
              agg!
                .flatMap((moves) => moves)
                .map((move) => move.releasedPressure)
                .sum()
            ) {
              agg = bestPotentialMoves;
            }
            parsedMoves.push(move);
            console.log('Parsed move', parsedMoves.length);
          };

          worker.postMessage([
            moveIdx,
            move,
            valves,
            copiedAgents,
            timeLeft,
            openedValves.concat(...[move.destination]),
          ]);
        });

        console.log('Waiting for results...');
        while (parsedMoves.length < potentialMoves.length) {
          await new Promise((r) => setTimeout(r, 100));
        }

        return agg;
      } else {
        for (const move of potentialMoves) {
          var copiedAgents = agents.map((a) => Object.assign({}, a));
          copiedAgents[idx].nextPositions = move.positions;
          copiedAgents[idx].currentState = 'moving';
          if (openedValves.length == 0) {
            counter.higherValue += 1;
          }
          var bestPotentialMoves = findBestValveOpeningMoves(
            valves,
            copiedAgents,
            timeLeft,
            openedValves.concat(...[move.destination]),
            undefined,
            counter
          );
          bestPotentialMoves[idx] = [move].concat(...bestPotentialMoves[idx]);
          if (
            bestPotentialMoves
              .flatMap((moves) => moves)
              .map((move) => move.releasedPressure)
              .sum() >
            agg!
              .flatMap((moves) => moves)
              .map((move) => move.releasedPressure)
              .sum()
          ) {
            agg = bestPotentialMoves;
          }
        }
        return agg;
      }
    }
  }

  // Moving agents
  for (let idx = 0; idx < agents.length; idx++) {
    const agent = agents[idx];
    if (agent.currentState == 'moving') {
      if (agent.nextPositions.length > 0) {
        agent.currentPosition = agent.nextPositions[0];
        agent.nextPositions = agent.nextPositions.slice(1);
      } else {
        agent.currentState = 'opening';
      }
    }
  }

  return findBestValveOpeningMoves(
    valves,
    agents,
    timeLeft - 1,
    openedValves,
    agg,
    counter
  );
}
