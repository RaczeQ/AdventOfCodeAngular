import { Component, OnInit } from '@angular/core';
import { BaseResultComponent } from 'src/app/helper/components/base-result.component';
import { ScriptsLoaderService } from 'src/app/helper/services/scripts-loader.service';
import { colorInterpolate } from 'src/app/helper/util-functions/color-interpolate';
import { normalize } from 'src/app/helper/util-functions/normalize';
import {
  ValveOpenerMove,
  ValveOpenerMoveWithPositions,
  Valves,
} from '../../helper/day16';

declare let vis: any;

@Component({
  selector: 'aoc-pressure-valves-visualizer',
  templateUrl: './pressure-valves-visualizer.component.html',
  styleUrls: ['./pressure-valves-visualizer.component.scss'],
})
export class PressureValvesVisualizerComponent
  extends BaseResultComponent
  implements OnInit
{
  networkId!: string;
  visLoaded: boolean = false;
  constructor(private scripts: ScriptsLoaderService) {
    super();
    this.networkId = (Math.random() + 1).toString(36).substring(2);
  }

  ngOnInit(): void {
    var valves: Valves = this.data.valves as Valves;
    var moves: ValveOpenerMoveWithPositions[][] = this.data
      .moves as ValveOpenerMoveWithPositions[][];
    var openedValves: string[] = moves.flatMap((agentMoves) =>
      agentMoves.map((move) => move.destination)
    );
    var fullPaths = moves.map((agentMoves) =>
      ['AA'].concat(...agentMoves.flatMap((moves) => moves.positions))
    );
    var pathPairs = fullPaths.map((path, idx) =>
      path.slice(1).map((destination, step) => {
        return {
          from: path[step],
          to: destination,
        };
      })
    );
    // console.log(pathPairs);
    // console.log(moves);
    // console.log(openedValves);
    // console.log(fullPaths);
    var maxValue = Math.max(...Object.values(valves).map((v) => v.flowRate));

    this.scripts
      .loadScript(
        'VisNetwork',
        'https://unpkg.com/vis-network/standalone/umd/vis-network.min.js'
      )
      .then(() => {
        var nodes = new vis.DataSet(
          Object.keys(valves).map((l) => {
            return {
              id: l,
              label: l,
              title: 'Flow rate: ' + valves[l].flowRate,
              borderWidth: 4,
              color: {
                border: openedValves.includes(l) ? '#fad02c' : '#ffffff',
                background: colorInterpolate(
                  'rgb(255, 255, 255)',
                  'rgb(250, 208, 44)',
                  normalize(valves[l].flowRate, 0, maxValue, 0, 1)
                ),
              },
              font: {
                face: 'Overpass Mono',
                mono: true,
                size: valves[l].flowRate * 1.5 + 14,
              },
              shadow: openedValves.includes(l)
                ? {
                    enabled: true,
                    // text-shadow: 0 0 2px #fad02c, 0 0 5px #fad02c;
                    color: '#fad02c',
                    size: 10,
                    x: 0,
                    y: 0,
                  }
                : false,
            };
          })
        );
        var baseEdges = Object.keys(valves).flatMap((sourceLabel) =>
          Object.keys(valves[sourceLabel].connections)
            .map((destinationLabel) => {
              if (
                valves[sourceLabel].connections[destinationLabel].distance ==
                  1 &&
                sourceLabel < destinationLabel
              ) {
                return {
                  from: sourceLabel,
                  to: destinationLabel,
                  value: 1,
                  color: {
                    inherit: 'both',
                    opacity: 0.1,
                  },
                  smooth: false,
                };
              }
              return null;
            })
            .filter((edge) => edge != null)
        );
        var moveEdges = pathPairs.flatMap((path) =>
          path.map((tunnel) => {
            return {
              from: tunnel.from,
              to: tunnel.to,
              value: 1,
              color: {
                color: '#fad02c',
                opacity: 0.25,
              },
              smooth: false,
            };
          })
        );
        var labelEdges = pathPairs
          .flatMap((path, idx) =>
            path.map((tunnel, moveIdx) => {
              var existingMoves = path.reduce(function (a: number[], e, i) {
                if (
                  (e.from === tunnel.from && e.to === tunnel.to) ||
                  (e.from === tunnel.to && e.to === tunnel.from)
                )
                  a.push(i + 1);
                return a;
              }, []);
              if (moveIdx > existingMoves[0]) {
                return null;
              }
              return {
                from: tunnel.from,
                to: tunnel.to,
                value: 1,
                label: `${idx == 0 ? '🧑' : '🐘'}: ${existingMoves.join(', ')}`,
                font: {
                  align: idx == 0 ? 'top' : 'bottom',
                  color: '#ffffff',
                  strokeWidth: 0,
                },
                color: {
                  opacity: 0,
                },
                smooth: false,
              };
            })
          )
          .filter((edge) => edge != null);
        var edges = new vis.DataSet(
          (baseEdges as any).concat(...moveEdges).concat(...labelEdges)
        );

        var container = document.getElementById(this.networkId);

        // provide the data in the vis format
        var data = {
          nodes: nodes,
          edges: edges,
        };
        var options = {
          physics: {
            barnesHut: {
              springConstant: 0,
              avoidOverlap: 0.5,
            },
          },
          nodes: {
            shape: 'circle',
          },
        };

        // initialize your network!
        var network = new vis.Network(container, data, options);
        // network.stabilize();
      });
  }
}
