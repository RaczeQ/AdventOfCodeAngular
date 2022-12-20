/// <reference lib="webworker" />
import '../../helper/util-functions/extensions';
import { evaluateBlueprint } from '../helper/day19';

addEventListener('message', async ({ data }) => {
  console.log('Worker start', data[0].id);
  var { materials, robots } = evaluateBlueprint(data[0], data[1], data[2]);
  postMessage({ blueprint: data[0], materials, robots });
});
