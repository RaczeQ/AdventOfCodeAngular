import { euclidean2D } from './distances';
import { Point2D } from './point';

export interface Position extends Point2D {
  value: number;
  neighbours: Position[];
}

export function generatePositions(
  numbersArray: number[][],
  multiplier: number = 1
): Position[] {
  var height = numbersArray.length;
  var width = numbersArray[0].length;
  var positions: Position[] = [];
  for (let ix = 0; ix < multiplier; ix++) {
    for (let iy = 0; iy < multiplier; iy++) {
      numbersArray.forEach((row, y) =>
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
    var x = idx % newWidth;
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
export function aStar(
  positions: Position[],
  start: number,
  goal: number
): { dist: number[]; parents: (number | undefined)[] } {
  var width = positions[positions.length - 1].x + 1;
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
  priorities[start] = euclidean2D(positions[start], positions[goal]);

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
    for (var i = 0; i < positions[lowestPriorityIndex].neighbours.length; i++) {
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
            euclidean2D(positions[neighbourIdx], positions[goal]);
          parents[neighbourIdx] = lowestPriorityIndex;
        }
      }
    }
    // Lastly, note that we are finished with this node.
    visited[lowestPriorityIndex] = true;
  }
}
