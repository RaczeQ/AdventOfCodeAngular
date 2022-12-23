import { Component, OnInit } from '@angular/core';
import { BaseResultComponent } from 'src/app/helper/components/base-result.component';
import { ScriptsLoaderService } from 'src/app/helper/services/scripts-loader.service';
import {
  colorInterpolate,
  getRgb,
} from 'src/app/helper/util-functions/color-interpolate';
import { isNumber } from 'src/app/helper/util-functions/is-number';
import { normalize } from 'src/app/helper/util-functions/normalize';
import { EquationComponent, MathMonkey } from '../../day21.service';

declare let cytoscape: any;
declare let math: any;
declare let MathJax: any;

@Component({
  selector: 'aoc-monkey-math-equations-visualizer',
  templateUrl: './monkey-math-equations-visualizer.component.html',
  styleUrls: ['./monkey-math-equations-visualizer.component.scss'],
})
export class MonkeyMathEquationsVisualizerComponent
  extends BaseResultComponent
  implements OnInit
{
  networkId!: string;
  visLoaded: boolean = false;
  showNetwork: boolean = true;
  showEquations: boolean = false;
  constructor(private scripts: ScriptsLoaderService) {
    super();
    this.networkId = (Math.random() + 1).toString(36).substring(2);
  }

  showMonkeysNetwork() {
    var monkeys: { [monkeyName: string]: MathMonkey } = this.data.monkeys as {
      [monkeyName: string]: MathMonkey;
    };

    var maxValue = Math.max(
      ...Object.keys(monkeys).map((monkeyName) =>
        monkeys[monkeyName].yellNumber()
      )
    );

    var maxDepth = Math.max(
      ...Object.keys(monkeys).map((monkeyName) => monkeys[monkeyName].depth!)
    );

    var nodes: any[] = Object.keys(monkeys).flatMap((monkeyName) => {
      var monkeyNumber = monkeys[monkeyName].yellNumber();
      var color = getRgb(
        colorInterpolate(
          'rgb(255, 255, 255)',
          'rgb(250, 208, 44)',
          normalize(monkeyNumber, 0, maxValue, 0, 1)
        )
      );
      return [
        {
          data: {
            id: monkeyName + '|',
            shape: 'ellipse',
            label: '🐒' + monkeyName,
            depth: maxDepth - monkeys[monkeyName].depth!,
            bg: [color.r, color.g, color.b],
            fg: [255, 255, 255],
            op: 0,
          },
          classes: 'top-center',
          grabbable: false,
        },
        {
          data: {
            parent: monkeyName + '|',
            id: monkeyName,
            shape: 'ellipse',
            label: monkeyNumber,
            depth: maxDepth - monkeys[monkeyName].depth!,
            bg: [color.r, color.g, color.b],
            fg: [255, 255, 255],
            op: 1,
          },
          classes: 'center-center',
          grabbable: false,
        },
      ];
    });
    var edges: any[] = Object.keys(monkeys).flatMap((monkeyName) => {
      if (monkeys[monkeyName].monkeyLeft === undefined) {
        return [];
      }
      return [
        monkeys[monkeyName].monkeyLeft,
        monkeys[monkeyName].monkeyRight,
      ].map((monkeyDest) => {
        return {
          data: {
            source: monkeyName,
            target: monkeyDest,
          },
        };
      });
    });

    var cy = cytoscape({
      container: document.getElementById(this.networkId),

      boxSelectionEnabled: false,
      autounselectify: true,

      layout: {
        name: 'concentric',
        startAngle: Math.PI,
        concentric: function (node: any) {
          return node._private.data.depth;
        },
        levelWidth: function (nodes: any[]) {
          return 1;
        },
        spacingFactor: 2.5,
      },

      elements: {
        edges,
        nodes,
      },

      style: [
        // the stylesheet for the graph
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            'background-color': 'data(bg)',
            'background-opacity': 'data(op)',
            color: 'data(fg)',
            'font-family': ['Overpass Mono', 'monospace'],
          },
        },
        {
          selector: 'edge',
          style: {
            width: 3,
            'line-color': '#fff',
            'target-arrow-color': '#fff',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            opacity: 0.1,
          },
        },
      ],
    });
  }

  renderEquation(divId: string, equations: string[]) {
    var output = document.getElementById(divId)!;
    output.innerHTML = '';

    var options = MathJax.getMetricsFor(output);
    equations.forEach(async (equation) => {
      await MathJax.tex2svgPromise(equation, options).then(function (
        node: any
      ) {
        node.classList.add('eq-smaller-margin');
        output.appendChild(node);
        MathJax.startup.document.clear();
        MathJax.startup.document.updateDocument();
      });
    });
  }

  getOperator(op: string): string {
    switch (op) {
      case '+':
        return 'add';
      case '-':
        return 'subtract';
      case '*':
        return 'multiply';
      case '/':
        return 'divide';
    }
    return '';
  }

  getMathNode(equation: EquationComponent | number | string): any {
    if (!Object.keys(equation).includes('left')) {
      if (isNumber(equation as string)) {
        return new math.ConstantNode(Number(equation));
      }
      return new math.SymbolNode(equation);
    }
    equation = equation as EquationComponent;
    return new math.OperatorNode(
      equation.operator,
      this.getOperator(equation.operator),
      [
        this.getMathNode(equation.left as EquationComponent),
        this.getMathNode(equation.right as EquationComponent),
      ]
    );
  }

  customLaTeX(node: any, options: any): any {
    if (node.fn === 'divide') {
      return (
        '\\left( ' +
        node.args[0].toTex(options) +
        '\\right) / \\left(' +
        node.args[1].toTex(options) +
        ' \\right)'
      );
    }
  }

  getFullLaTeX(equation: EquationComponent | number | string): string[] {
    return this.splitLaTeX(
      this.getMathNode(equation)
        .toTex({ handler: this.customLaTeX })
        .replaceAll('\\frac', '\\cfrac')
        .replaceAll('\\left', '\\bigl')
        .replaceAll('\\right', '\\bigr')
    );
  }

  splitLaTeX(equation: string): string[] {
    var splitEvery: number = 30;
    var patt = /\d+/gm;
    var match;
    var matches = [];
    var equations: string[] = [];
    var previousIdx = 0;
    while ((match = patt.exec(equation))) {
      matches.push([match.index, match.index + match[0].length]);
    }
    var counter = 0;
    matches.forEach(([start, end]) => {
      counter++;
      if (counter % splitEvery === 0) {
        var nextSign = equation[end];
        if (['+', '-'].includes(nextSign)) {
          equations.push(equation.slice(previousIdx, end + 1));
          previousIdx = end;
        } else {
          counter--;
        }
      }
    });
    equations.push(equation.slice(previousIdx));
    return equations;
  }

  async generateEquations() {
    var equationData = this.data.equationData as {
      humanNumber: number;
      leftEquation: EquationComponent;
      leftEquationCollapsed: EquationComponent;
      rightEquation: EquationComponent;
      rightEquationCollapsed: EquationComponent;
      finalEquation: EquationComponent;
      finalEquationCollapsed: EquationComponent;
    };

    var leftEquationTex = this.getFullLaTeX(equationData.leftEquation);
    var leftCollapsedEquationTex = this.getFullLaTeX(
      equationData.leftEquationCollapsed
    );

    var rightEquationTex = this.getFullLaTeX(equationData.rightEquation);
    var rightCollapsedEquationTex = this.getFullLaTeX(
      equationData.rightEquationCollapsed
    );

    var finalEquationTex = this.getFullLaTeX(equationData.finalEquation);

    this.renderEquation(
      'leftEq',
      leftEquationTex
        .concat(...['\\Downarrow \\text{(simplify)}'])
        .concat(...leftCollapsedEquationTex)
    );

    this.renderEquation(
      'rightEq',
      rightEquationTex
        .concat(...['\\Downarrow \\text{(simplify)}'])
        .concat(...rightCollapsedEquationTex)
    );

    this.renderEquation(
      'finalEq',
      leftCollapsedEquationTex
        .concat(...['='])
        .concat(...rightCollapsedEquationTex)
    );

    this.renderEquation(
      'finalCollapsedEq',
      ['humn']
        .concat(...['='])
        .concat(...finalEquationTex)
        .concat(...['='])
        .concat(...[equationData.humanNumber.toString()])
    );
  }

  ngOnInit(): void {
    if (this.data.monkeys) {
      this.scripts
        .loadScript(
          'Cytoscape',
          'https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.23.0/cytoscape.min.js'
        )
        .then(() => this.showMonkeysNetwork());
    } else if (this.data.equationData) {
      this.showEquations = true;
      this.showNetwork = false;
      this.scripts
        .loadScript(
          'MathJs',
          'https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.5.0/math.min.js'
        )
        .then(() =>
          this.scripts
            .loadScript(
              'MathJax',
              // 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js'
              'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js'
            )
            .then(() => this.generateEquations())
        );
    }
  }
}
