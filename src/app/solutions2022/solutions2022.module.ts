import { APP_INITIALIZER, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { HelperModule } from '../helper/helper.module';
import { ISolutionService } from '../helper/services/isolution.service';

import { Day1Service } from './day1.service';

@NgModule({
  id: '2022',
  declarations: [
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
      ],
      useFactory: (solutionService: ISolutionService) => () => null,
    },
  ],
})
export class Solutions2022Module {}
