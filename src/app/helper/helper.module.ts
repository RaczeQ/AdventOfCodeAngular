import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';

PlotlyModule.plotlyjs = PlotlyJS;

import { CanActivateDay } from './activate-route-guards/can-activate-day';
import { DaySelectionComponent } from './components/day-selection/day-selection.component';
import { YearSelectionComponent } from './components/year-selection/year-selection.component';
import { SolutionComponent } from './components/solution/solution.component';
import { RouterModule } from '@angular/router';
import { SolutionsCollectorService } from './services/solutions-collector.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CanActivateYear } from './activate-route-guards/can-activate-year';
import { PlotlyGraphComponentComponent } from './components/plotly-graph-component/plotly-graph-component.component';

@NgModule({
  declarations: [
    SolutionComponent,
    DaySelectionComponent,
    YearSelectionComponent,
    PlotlyGraphComponentComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    PlotlyModule,
    ClipboardModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
  ],
  providers: [CanActivateYear, CanActivateDay, SolutionsCollectorService],
})
export class HelperModule {}