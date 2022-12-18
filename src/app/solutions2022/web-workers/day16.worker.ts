/// <reference lib="webworker" />
import '../../helper/util-functions/extensions';
import { findBestValveOpeningMoves } from '../helper/day16';

addEventListener('message', async ({ data }) => {
  var idx = data[0];
  var move = data[1];
  console.log('Worker start', idx);
  var bestPotentialMoves = findBestValveOpeningMoves(
    data[2],
    data[3],
    data[4],
    data[5],
    undefined,
    { value: -1, higherValue: idx }
  );
  postMessage({ move, bestPotentialMoves });
});
