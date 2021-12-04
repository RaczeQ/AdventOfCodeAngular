import { Component, OnInit } from '@angular/core';
import {
  AvailableSolutions,
  SolutionsCollectorService,
} from '../../services/solutions-collector.service';

@Component({
  selector: 'aoc-year-selection',
  templateUrl: './year-selection.component.html',
  styleUrls: ['./year-selection.component.scss'],
})
export class YearSelectionComponent implements OnInit {
  availableYears: number[] = [];
  availableSolutions: AvailableSolutions = {};
  constructor(private solutionsCollectorService: SolutionsCollectorService) {}

  ngOnInit() {
    this.solutionsCollectorService
      .getAvailableYearsObservable()
      .subscribe((years) => (this.availableYears = years));
    this.solutionsCollectorService
      .getAvailableSolutionsObservable()
      .subscribe((solutions) => (this.availableSolutions = solutions));
  }

  getDays(year: number): number {
    return Object.keys(this.availableSolutions[year]).length;
  }
}
