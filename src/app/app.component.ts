import { Component } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import {
  AvailableSolutions,
  SolutionsCollectorService,
} from './helper/services/solutions-collector.service';

@Component({
  selector: 'aoc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'AdventOfCode';
  selectedYear: number = 0;
  selectedDay: number = 0;
  actionName: string = '';
  availableSolutions: AvailableSolutions = {};
  constructor(
    private router: Router,
    private solutionsCollectorService: SolutionsCollectorService
  ) {
    router.events.subscribe((event) => {
      if (event instanceof ActivationEnd) {
        this.selectedYear = Number(event.snapshot.params['year']);
        this.selectedDay = Number(event.snapshot.params['day']);
        if (this.selectedDay) {
          this.actionName = 'Go back';
        } else if (this.selectedYear) {
          this.actionName = 'Select day';
        } else {
          this.actionName = 'Select year';
        }
      }
    });

    solutionsCollectorService
      .getAvailableSolutionsObservable()
      .subscribe((solutions) => (this.availableSolutions = solutions));
  }

  get canGoToPreviousDay(): boolean {
    return this.selectedDay - 1 in this.availableSolutions[this.selectedYear];
  }

  get canGoToNextDay(): boolean {
    return this.selectedDay + 1 in this.availableSolutions[this.selectedYear];
  }

  goToRepo(): void {
    window.open('https://github.com/RaczeQ/AdventOfCodeAngular', '_blank');
  }
}
