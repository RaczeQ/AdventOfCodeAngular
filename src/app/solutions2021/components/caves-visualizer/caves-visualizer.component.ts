import { Component, OnInit } from '@angular/core';
import { BaseResultComponent } from 'src/app/helper/components/base-result.component';
import { ScriptsLoaderService } from 'src/app/helper/services/scripts-loader.service';

declare let vis: any;

@Component({
  selector: 'aoc-caves-visualizer',
  templateUrl: './caves-visualizer.component.html',
  styleUrls: ['./caves-visualizer.component.scss'],
})
export class CavesVisualizerComponent
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
    var sources: number[] = this.data.sources as number[];
    var targets: number[] = this.data.targets as number[];
    var values: number[] = this.data.values as number[];
    var labels: string[] = this.data.labels as string[];
    var maxValue = Math.max(...values);
    this.scripts
      .loadScript(
        'VisNetwork',
        'https://unpkg.com/vis-network/standalone/umd/vis-network.min.js'
      )
      .then(() => {
        var nodes = new vis.DataSet(
          labels.map((l, idx) => {
            return { id: idx, label: l };
          })
        );
        var edges = new vis.DataSet(
          sources.map((s, idx) => {
            return {
              from: s,
              to: targets[idx],
              value: values[idx] / maxValue,
              arrows: 'to',
              color: '#fad02c',
            };
          })
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
              avoidOverlap: 0.2,
            },
          },
        };

        // initialize your network!
        var network = new vis.Network(container, data, options);
        // network.stabilize();
      });
  }
}
