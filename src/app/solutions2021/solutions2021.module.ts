import { APP_INITIALIZER, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { HelperModule } from '../helper/helper.module';
import { ISolutionService } from '../helper/services/isolution.service';

import { BingoVisualizerComponent } from './components/bingo-visualizer/bingo-visualizer.component';
import { OctopusFlashesVisualizerComponent } from './components/octopus-flashes-visualizer/octopus-flashes-visualizer.component';
import { SevenSegmentsDisplayVisualizerComponent } from './components/seven-segments-display-visualizer/seven-segments-display-visualizer.component';
import { SyntaxErrorLinesVisualizerComponent } from './components/syntax-error-lines-visualizer/syntax-error-lines-visualizer.component';

import { Day1Service } from './day1.service';
import { Day2Service } from './day2.service';
import { Day3Service } from './day3.service';
import { Day4Service } from './day4.service';
import { Day5Service } from './day5.service';
import { Day6Service } from './day6.service';
import { Day7Service } from './day7.service';
import { Day8Service } from './day8.service';
import { Day9Service } from './day9.service';
import { Day10Service } from './day10.service';
import { Day11Service } from './day11.service';
import { Day12Service } from './day12.service';

@NgModule({
  id: '2021',
  declarations: [
    BingoVisualizerComponent,
    OctopusFlashesVisualizerComponent,
    SevenSegmentsDisplayVisualizerComponent,
    SyntaxErrorLinesVisualizerComponent,
  ],
  imports: [CommonModule, HelperModule, MatButtonModule],
  providers: [
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [
        Day1Service,
        Day2Service,
        Day3Service,
        Day4Service,
        Day5Service,
        Day6Service,
        Day7Service,
        Day8Service,
        Day9Service,
        Day10Service,
        Day11Service,
        Day12Service,
      ],
      useFactory: (solutionService: ISolutionService) => () => null,
    },
  ],
})
export class Solutions2021Module {}
