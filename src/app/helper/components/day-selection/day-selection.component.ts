import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SolutionsCollectorService } from '../../services/solutions-collector.service';

@Component({
  selector: 'aoc-day-selection',
  templateUrl: './day-selection.component.html',
  styleUrls: ['./day-selection.component.scss'],
})
export class DaySelectionComponent {
  availableDays: [number, string][] = [];
  constructor(
    private solutionsCollectorService: SolutionsCollectorService,
    private route: ActivatedRoute
  ) {
    var year = route.snapshot.params["year"];
    this.solutionsCollectorService
      .getAvailableDaysObservable(year)
      .subscribe((days) => (this.availableDays = days));
  }
}
