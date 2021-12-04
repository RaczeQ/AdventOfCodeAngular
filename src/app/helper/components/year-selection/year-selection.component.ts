import { Component, OnInit } from '@angular/core';
import { SolutionsCollectorService } from '../../services/solutions-collector.service';

@Component({
  selector: 'aoc-year-selection',
  templateUrl: './year-selection.component.html',
  styleUrls: ['./year-selection.component.scss'],
})
export class YearSelectionComponent implements OnInit {
  availableYears: number[] = [];
  constructor(private solutionsCollectorService: SolutionsCollectorService) {}

  ngOnInit() {
    this.solutionsCollectorService
      .getAvailableYearsObservable()
      .subscribe((years) => (this.availableYears = years));
  }
}
