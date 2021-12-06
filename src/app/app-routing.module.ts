import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanActivateDay } from './helper/activate-route-guards/can-activate-day';
import { CanActivateYear } from './helper/activate-route-guards/can-activate-year';
import { DaySelectionComponent } from './helper/components/day-selection/day-selection.component';
import { SolutionComponent } from './helper/components/solution/solution.component';
import { YearSelectionComponent } from './helper/components/year-selection/year-selection.component';

const routes: Routes = [
  {
    path: ':year/:day',
    canActivate: [CanActivateDay],
    component: SolutionComponent,
  },
  {
    path: ':year',
    canActivate: [CanActivateYear],
    component: DaySelectionComponent,
  },
  {
    path: '',
    component: YearSelectionComponent,
    pathMatch: 'full'
  },
  { path: '**', redirectTo: '/' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule],
})
export class AppRoutingModule {}
