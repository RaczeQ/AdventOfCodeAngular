import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';

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
import { PlotlyGraphComponent } from './components/plotly-graph/plotly-graph.component';
import { ScriptsLoaderService } from './services/scripts-loader.service';

@NgModule({
  declarations: [
    SolutionComponent,
    DaySelectionComponent,
    YearSelectionComponent,
    PlotlyGraphComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    PlotlyModule,
    ClipboardModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatProgressBarModule,
  ],
  providers: [
    CanActivateYear,
    CanActivateDay,
    ScriptsLoaderService,
    SolutionsCollectorService,
  ],
})
export class HelperModule {}
