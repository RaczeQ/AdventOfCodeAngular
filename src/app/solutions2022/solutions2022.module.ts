import { APP_INITIALIZER, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { HelperModule } from '../helper/helper.module';
import { ISolutionService } from '../helper/services/isolution.service';

import { CampSectionsVisualizerComponent } from './components/camp-sections-visualizer/camp-sections-visualizer.component';
import { CargoVisualizerComponent } from './components/cargo-visualizer/cargo-visualizer.component';
import { CargoStepVisualizerComponent } from './components/cargo-visualizer/cargo-step-visualizer/cargo-step-visualizer.component';
import { DatastreamBufferVisualizerComponent } from './components/datastream-buffer-visualizer/datastream-buffer-visualizer.component';
import { DeviceFileVisualizerComponent } from './components/device-file-visualizer/device-file-visualizer.component';
import { RopeBridgeVisualizerComponent } from './components/rope-bridge-visualizer/rope-bridge-visualizer.component';
import { MonkeysInspectionsVisualizerComponent } from './components/monkeys-inspections-visualizer/monkeys-inspections-visualizer.component';
import { MonkeyInspectionVisualizerComponent } from './components/monkeys-inspections-visualizer/monkey-inspection-visualizer/monkey-inspection-visualizer.component';
import { PacketNumbersVisualizerComponent } from './components/packet-numbers-visualizer/packet-numbers-visualizer.component';
import { FallingSandVisualizerComponent } from './components/falling-sand-visualizer/falling-sand-visualizer.component';
import { PressureValvesVisualizerComponent } from './components/pressure-valves-visualizer/pressure-valves-visualizer.component';
import { FallingRocksVisualizerComponent } from './components/falling-rocks-visualizer/falling-rocks-visualizer.component';
import { MonkeyMathEquationsVisualizerComponent } from './components/monkey-math-equations-visualizer/monkey-math-equations-visualizer.component';
import { MonkeyMapCubeVisualizerComponent } from './components/monkey-map-cube-visualizer/monkey-map-cube-visualizer.component';
import { ElvesMovesVisualizerComponent } from './components/elves-moves-visualizer/elves-moves-visualizer.component';

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

@NgModule({
  id: '2022',
  declarations: [
    CampSectionsVisualizerComponent,
    CargoVisualizerComponent,
    CargoStepVisualizerComponent,
    DatastreamBufferVisualizerComponent,
    DeviceFileVisualizerComponent,
    RopeBridgeVisualizerComponent,
    MonkeysInspectionsVisualizerComponent,
    MonkeyInspectionVisualizerComponent,
    PacketNumbersVisualizerComponent,
    FallingSandVisualizerComponent,
    PressureValvesVisualizerComponent,
    FallingRocksVisualizerComponent,
    MonkeyMathEquationsVisualizerComponent,
    MonkeyMapCubeVisualizerComponent,
    ElvesMovesVisualizerComponent,
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
      ],
      useFactory: (solutionService: ISolutionService) => () => null,
    },
  ],
})
export class Solutions2022Module {}
