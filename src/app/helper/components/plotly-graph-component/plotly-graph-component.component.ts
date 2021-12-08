import { Component, OnInit } from '@angular/core';
import { BaseResultComponent } from '../base-result.component';

@Component({
  selector: 'aoc-plotly-graph-component',
  templateUrl: './plotly-graph-component.component.html',
  styleUrls: ['./plotly-graph-component.component.scss'],
})
export class PlotlyGraphComponentComponent
  extends BaseResultComponent
  implements OnInit
{
  graphData: Plotly.Data[] = [];
  graphLayout: Partial<Plotly.Layout> = {};
  graphConfig: Partial<Plotly.Config> = {};

  ngOnInit(): void {
    this.graphData = this.data.graphData ?? [];
    this.graphLayout = this.data.graphLayout ?? {};
    (this.graphLayout.margin = {
      l: 64,
      r: 64,
      b: 32,
      t: 32,
      // pad: 0
    }),
      (this.graphLayout.paper_bgcolor = 'rgba(0,0,0,0)');
    this.graphLayout.plot_bgcolor = 'rgba(0,0,0,0)';
    this.graphLayout.legend = {
      font: {
        color: '#ffffff',
      },
    };
    if (!this.graphLayout.xaxis) {
      this.graphLayout.xaxis = {};
    }
    this.graphLayout.xaxis.showgrid = false;
    this.graphLayout.xaxis.zeroline = false;
    this.graphLayout.xaxis.showline = true;
    this.graphLayout.xaxis.color = '#ffffff';
    this.graphLayout.xaxis.tickfont = {
      color: '#ffffff',
    };
    if (!this.graphLayout.yaxis) {
      this.graphLayout.yaxis = {};
    }
    this.graphLayout.yaxis.showgrid = false;
    this.graphLayout.yaxis.showline = true;
    this.graphLayout.yaxis.zeroline = false;
    this.graphLayout.yaxis.color = '#ffffff';
    this.graphLayout.xaxis.tickfont = {
      color: '#ffffff',
    };
    this.graphConfig = this.data.graphConfig ?? {
      displayModeBar: false,
      staticPlot: true,
    };
    // console.log('ngOnInit', this.graphLayout, this.graphData);
  }
}
