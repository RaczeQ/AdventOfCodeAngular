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

import { Day1Service } from './day1.service';
import { Day2Service } from './day2.service';
import { Day3Service } from './day3.service';
import { Day4Service } from './day4.service';
import { Day5Service } from './day5.service';
import { Day6Service } from './day6.service';

@NgModule({
  id: '2022',
  declarations: [
    CampSectionsVisualizerComponent,
    CargoVisualizerComponent,
    CargoStepVisualizerComponent,
    DatastreamBufferVisualizerComponent,
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
      ],
      useFactory: (solutionService: ISolutionService) => () => null,
    },
  ],
})
export class Solutions2022Module {}