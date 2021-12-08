import { APP_INITIALIZER, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { HelperModule } from '../helper/helper.module';
import { ISolutionService } from '../helper/services/isolution.service';

import { BingoVisualizerComponent } from './components/bingo-visualizer/bingo-visualizer.component';

import { Day1Service } from './day1.service';
import { Day2Service } from './day2.service';
import { Day3Service } from './day3.service';
import { Day4Service } from './day4.service';
import { Day5Service } from './day5.service';

@NgModule({
  id: '2021',
  declarations: [BingoVisualizerComponent],
  imports: [CommonModule, HelperModule, MatButtonModule],
  providers: [
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [Day1Service, Day2Service, Day3Service, Day4Service, Day5Service],
      useFactory: (day1Service: ISolutionService) => () => null,
    },
  ],
})
export class Solutions2021Module {}
