import { APP_INITIALIZER, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { HelperModule } from '../helper/helper.module';
import { ISolutionService } from '../helper/services/isolution.service';

import { AmphipodsRoomVisualizerComponent } from './components/amphipods-room-visualizer/amphipods-room-visualizer.component';
import { ArithmeticLogicUnitVisualizerComponent } from './components/arithmetic-logic-unit-visualizer/arithmetic-logic-unit-visualizer.component';
import { BingoVisualizerComponent } from './components/bingo-visualizer/bingo-visualizer.component';
import { BitsVisualizerComponent } from './components/bits-visualizer/bits-visualizer.component';
import { CavesVisualizerComponent } from './components/caves-visualizer/caves-visualizer.component';
import { OceanTrenchVisualizerComponent } from './components/ocean-trench-visualizer/ocean-trench-visualizer.component';
import { OctopusFlashesVisualizerComponent } from './components/octopus-flashes-visualizer/octopus-flashes-visualizer.component';
import { SeaCucumbersVisualizerComponent } from './components/sea-cucumbers-visualizer/sea-cucumbers-visualizer.component';
import { SevenSegmentsDisplayVisualizerComponent } from './components/seven-segments-display-visualizer/seven-segments-display-visualizer.component';
import { SnailfishNumberVisualizerComponent } from './components/snailfish-number-visualizer/snailfish-number-visualizer.component';
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
import { Day13Service } from './day13.service';
import { Day14Service } from './day14.service';
import { Day15Service } from './day15.service';
import { Day16Service } from './day16.service';
import { Day17Service } from './day17.service';
import { Day18Service } from './day18.service';
import { Day19Service } from './day19.service';
import { Day20Service } from './day20.service';
import { Day21Service } from './day21.service';
import { Day22Service } from './day22.service';
import { Day23Service } from './day23.service';
import { Day24Service } from './day24.service';
import { Day25Service } from './day25.service';

@NgModule({
  id: '2021',
  declarations: [
    AmphipodsRoomVisualizerComponent,
    ArithmeticLogicUnitVisualizerComponent,
    BingoVisualizerComponent,
    BitsVisualizerComponent,
    CavesVisualizerComponent,
    OceanTrenchVisualizerComponent,
    OctopusFlashesVisualizerComponent,
    SeaCucumbersVisualizerComponent,
    SevenSegmentsDisplayVisualizerComponent,
    SnailfishNumberVisualizerComponent,
    SyntaxErrorLinesVisualizerComponent,
  ],
  imports: [
    CommonModule,
    HelperModule,
    FormsModule,
    MatButtonModule,
    MatSliderModule,
  ],
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
        Day13Service,
        Day14Service,
        Day15Service,
        Day16Service,
        Day17Service,
        Day18Service,
        Day19Service,
        Day20Service,
        Day21Service,
        Day22Service,
        Day23Service,
        Day24Service,
        Day25Service,
      ],
      useFactory: (solutionService: ISolutionService) => () => null,
    },
  ],
})
export class Solutions2021Module {}
