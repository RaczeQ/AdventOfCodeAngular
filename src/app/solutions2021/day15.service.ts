import { Injectable } from '@angular/core';
import { PlotlyGraphComponentComponent } from '../helper/components/plotly-graph-component/plotly-graph-component.component';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { parseInto2DNumbersArray } from '../helper/util-functions/parse-into-2d-numbers-array';

interface Position {
  x: number;
  y: number;
  value: number;
  neighbours: Position[];
}

function euclidean(a: Position, b: Position): number {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

@Injectable({
  providedIn: 'root',
})
export class Day15Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2021, 15, 'Chiton', 'Note that the algorithm works long for matrices of larger size (100x100). The page may hang for 3+ minutes during the calculation of part 2 (depending on the processor power).');
  }
  private generatePositions(input: string, multiplier: number = 1): Position[] {
    var chitons = parseInto2DNumbersArray(input);
    var height = chitons.length;
    var width = chitons[0].length;
    var positions: Position[] = [];
    for (let ix = 0; ix < multiplier; ix++) {
      for (let iy = 0; iy < multiplier; iy++) {
        chitons.forEach((row, y) =>
          row.forEach((v, x) => {
            var newValue = v;
            for (let iTemp = 0; iTemp < ix + iy; iTemp++) {
              newValue++;
              if (newValue > 9) {
                newValue = 1;
              }
            }
            positions.push({
              x: x + width * ix,
              y: y + height * iy,
              value: newValue,
              neighbours: [],
            });
          })
        );
      }
    }
    positions.sort((a, b) => (a.y == b.y ? a.x - b.x : a.y - b.y));
    var newHeight = height * multiplier;
    var newWidth = width * multiplier;
    positions.forEach((pos, idx) => {
      var x = idx % newHeight;
      var y = Math.floor(idx / newWidth);
      // up
      if (y > 0) {
        pos.neighbours.push(positions[idx - newWidth]);
      }
      // down
      if (y < newHeight - 1) {
        pos.neighbours.push(positions[idx + newWidth]);
      }
      // left
      if (x > 0) {
        pos.neighbours.push(positions[idx - 1]);
      }
      // right
      if (x < newWidth - 1) {
        pos.neighbours.push(positions[idx + 1]);
      }
      pos.neighbours.sort((a, b) => a.value - b.value);
    });
    return positions;
  }

  // https://www.algorithms-and-technologies.com/a_star/javascript
  aStar(
    positions: Position[],
    start: number,
    goal: number
  ): { dist: number[]; parents: (number | undefined)[] } {
    var width = positions[positions.length - 1].y + 1;
    //This contains the distances from the start node to all other nodes
    var distances = [];
    //This contains the priorities with which to visit the nodes, calculated using the heuristic.
    var priorities = [];
    //This contains whether a node was already visited
    var visited = [];
    //This contains parents a node was already visited
    var parents = [];

    // Initializing with a distance of "Infinity"
    for (var i = 0; i < positions.length; i++) {
      distances[i] = Number.MAX_VALUE;
      priorities[i] = Number.MAX_VALUE;
      visited[i] = false;
      parents[i] = undefined;
    }
    //The distance from the start node to itself is of course 0
    distances[start] = 0;
    //start node has a priority equal to straight line distance to goal. It will be the first to be expanded.
    priorities[start] = euclidean(positions[start], positions[goal]);

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
        return { dist: [-1], parents: [-1] };
      } else if (lowestPriorityIndex === goal) {
        // Goal node found
        return { dist: distances, parents };
      }

      //...then, for all neighboring nodes that haven't been visited yet....
      for (
        var i = 0;
        i < positions[lowestPriorityIndex].neighbours.length;
        i++
      ) {
        var neighbour = positions[lowestPriorityIndex].neighbours[i];
        var neighbourIdx = neighbour.x + neighbour.y * width;
        if (!visited[neighbourIdx]) {
          //...if the path over this edge is shorter...
          if (
            distances[lowestPriorityIndex] + neighbour.value <
            distances[neighbourIdx]
          ) {
            //...save this path as new shortest path
            distances[neighbourIdx] =
              distances[lowestPriorityIndex] + neighbour.value;
            //...and set the priority with which we should continue with this node
            priorities[neighbourIdx] =
              distances[neighbourIdx] +
              euclidean(positions[neighbourIdx], positions[goal]);
            parents[neighbourIdx] = lowestPriorityIndex;
          }
        }
      }
      // Lastly, note that we are finished with this node.
      visited[lowestPriorityIndex] = true;
    }
  }

  override solvePart1(input: string): PuzzleResult {
    var positions = this.generatePositions(input);
    var height = positions[positions.length - 1].y + 1;
    var width = positions[positions.length - 1].x + 1;
    var { dist, parents } = this.aStar(positions, 0, positions.length - 1);
    var path = [positions.length - 1];
    while (path[path.length - 1] !== undefined && path[path.length - 1] != 0) {
      path.push(parents[path[path.length - 1]]!);
    }
    var xValues: number[] = [];
    var yValues: number[] = [];
    var zValues: number[] = [];
    dist
      .map((p, idx) => {
        return { p, idx };
      })
      .filter((t) => t.p < Number.MAX_VALUE)
      .forEach((t) => {
        xValues.push(t.idx % height);
        yValues.push(Math.floor(t.idx / width));
        zValues.push(t.p);
      });
    return {
      result: dist[dist.length - 1],
      component: PlotlyGraphComponentComponent,
      componentData: {
        graphData: [
          {
            x: xValues,
            y: yValues,
            z: zValues,
            colorscale: 'Portland',
            type: 'heatmap',
            colorbar: {
              title: 'Distance from origin',
              titlefont: {
                color: '#ffffff',
              },
              tickfont: {
                color: '#ffffff',
              },
            },
          },
          {
            x: path.map((p) => p % height),
            y: path.map((p) => Math.floor(p / width)),
            mode: 'markers',
            marker: {
              size: path.map((p) => 5),
              color: '#ffffff',
            },
          },
        ],
        graphLayout: {
          yaxis: {
            title: 'Y',
            range: [height - 1 + 0.5, 0 - 0.5],
          },
          xaxis: {
            title: 'X',
            range: [0 - 0.5, width - 1 + 0.5],
          },
        },
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var positions = this.generatePositions(input, 5);
    var height = positions[positions.length - 1].y + 1;
    var width = positions[positions.length - 1].x + 1;
    var { dist, parents } = this.aStar(positions, 0, positions.length - 1);
    var path = [positions.length - 1];
    while (path[path.length - 1] !== undefined && path[path.length - 1] != 0) {
      path.push(parents[path[path.length - 1]]!);
    }
    var xValues: number[] = [];
    var yValues: number[] = [];
    var zValues: number[] = [];
    dist
      .map((p, idx) => {
        return { p, idx };
      })
      .filter((t) => t.p < Number.MAX_VALUE)
      .forEach((t) => {
        xValues.push(t.idx % height);
        yValues.push(Math.floor(t.idx / width));
        zValues.push(t.p);
      });
    return {
      result: dist[dist.length - 1],
      component: PlotlyGraphComponentComponent,
      componentData: {
        graphData: [
          {
            x: xValues,
            y: yValues,
            z: zValues,
            colorscale: 'Portland',
            type: 'heatmap',
            colorbar: {
              title: 'Distance from origin',
              titlefont: {
                color: '#ffffff',
              },
              tickfont: {
                color: '#ffffff',
              },
            },
          },
          {
            x: path.map((p) => p % height),
            y: path.map((p) => Math.floor(p / width)),
            mode: 'markers',
            marker: {
              size: path.map((p) => 5),
              color: '#ffffff',
            },
          },
        ],
        graphLayout: {
          yaxis: {
            title: 'Y',
            range: [height - 1 + 0.5, 0 - 0.5],
          },
          xaxis: {
            title: 'X',
            range: [0 - 0.5, width - 1 + 0.5],
          },
        },
      },
    };
  }
}
