import { Injectable } from '@angular/core';
import { BaseSolutionService } from '../helper/services/base-solution.service';
import {
  ISolutionService,
  PuzzleResult,
} from '../helper/services/isolution.service';
import { SolutionsCollectorService } from '../helper/services/solutions-collector.service';
import { splitIntoLines } from '../helper/util-functions/split-into-lines';
import { OceanTrenchVisualizerComponent } from './components/ocean-trench-visualizer/ocean-trench-visualizer.component';

@Injectable({
  providedIn: 'root',
})
export class Day20Service
  extends BaseSolutionService
  implements ISolutionService
{
  constructor(solutionsCollectorService: SolutionsCollectorService) {
    super(solutionsCollectorService, 2021, 20, 'Trench Map');
  }

  private enhance(
    algorithm: number[],
    startImage: number[][],
    steps: number = 2
  ): number[][][] {
    var result: number[][][] = [startImage];
    var padding = 2;
    for (let s = 0; s < steps; s++) {
      var enhancedImage: number[][] = [];
      var lastImage = result.slice(-1)[0];
      var height = lastImage.length;
      var width = lastImage[0].length;
      for (let y = -padding; y < height + padding - 2; y++) {
        var currentRow: number[] = [];
        for (let x = -padding; x < width + padding - 2; x++) {
          var numbersString = '';
          [0, 1, 2].forEach((yIdx) => {
            [0, 1, 2].forEach((xIdx) => {
              var yPos = y + yIdx;
              var xPos = x + xIdx;
              if (yPos >= 0 && yPos < height && xPos >= 0 && xPos < width) {
                numbersString += lastImage[yPos][xPos].toString();
              } else if (algorithm[0] == 1) {
                numbersString += (s % 2).toString();
              } else {
                numbersString += '0';
              }
            });
          });
          var kernelValue = Number.parseInt(numbersString, 2);
          currentRow.push(algorithm[kernelValue]);
        }
        enhancedImage.push(currentRow);
      }
      result.push(enhancedImage);
    }

    return result;
  }

  override solvePart1(input: string): PuzzleResult {
    var lines = splitIntoLines(input);
    var algorithm: number[] = lines[0].split('').map((c) => (c == '#' ? 1 : 0));
    var image: number[][] = lines
      .slice(2)
      .map((l) => l.split('').map((c) => (c == '#' ? 1 : 0)));
    var images = this.enhance(algorithm, image, 2);
    return {
      result: images
        .slice(-1)[0]
        .flat()
        .filter((d) => d == 1).length,
      component: OceanTrenchVisualizerComponent,
      componentData: {
        images: images,
      },
    };
  }
  override solvePart2(input: string): PuzzleResult {
    var lines = splitIntoLines(input);
    var algorithm: number[] = lines[0].split('').map((c) => (c == '#' ? 1 : 0));
    var image: number[][] = lines
      .slice(2)
      .map((l) => l.split('').map((c) => (c == '#' ? 1 : 0)));
    var images = this.enhance(algorithm, image, 50);
    return {
      result: images
        .slice(-1)[0]
        .flat()
        .filter((d) => d == 1).length,
      component: OceanTrenchVisualizerComponent,
      componentData: {
        images: images,
      },
    };
  }
}
