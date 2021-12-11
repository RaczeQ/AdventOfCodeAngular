import { APP_INITIALIZER, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { HelperModule } from '../helper/helper.module';
import { ISolutionService } from '../helper/services/isolution.service';

import { BingoVisualizerComponent } from './components/bingo-visualizer/bingo-visualizer.component';
import { SevenSegmentsDisplayVisualizerComponent } from './components/seven-segments-display-visualizer/seven-segments-display-visualizer.component';

import { Day1Service } from './day1.service';
import { Day2Service } from './day2.service';
import { Day3Service } from './day3.service';
import { Day4Service } from './day4.service';
import { Day5Service } from './day5.service';
import { Day6Service } from './day6.service';
import { Day7Service } from './day7.service';
import { Day8Service } from './day8.service';
import { Day9Service } from './day9.service';

@NgModule({
  id: '2021',
  declarations: [
    BingoVisualizerComponent,
    SevenSegmentsDisplayVisualizerComponent,
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
      ],
      useFactory: (solutionService: ISolutionService) => () => null,
    },
  ],
})
export class Solutions2021Module {}
