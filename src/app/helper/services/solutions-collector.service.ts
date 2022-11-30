import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { ISolutionService } from './isolution.service';

export interface SolutionObject {
  dayName: string;
  additionalInfo: string;
  service: ISolutionService;
}

export interface AvailableSolutions {
  [year: number]: {
    [day: number]: SolutionObject;
  };
}

@Injectable({
  providedIn: 'root',
})
export class SolutionsCollectorService {
  static readonly startYear: number = 2015;
  private availableSolutions = new BehaviorSubject<AvailableSolutions>({});

  getAvailableSolutionsObservable(): Observable<AvailableSolutions> {
    return this.availableSolutions.asObservable();
  }

  getAvailableYearsObservable(): Observable<number[]> {
    return this.availableSolutions
      .asObservable()
      .pipe(map((solutions) => Object.keys(solutions).map((k) => Number(k))));
  }

  getAvailableDaysObservable(year: number): Observable<[number, string][]> {
    return this.availableSolutions
      .asObservable()
      .pipe(
        map((solutions) =>
          year in solutions
            ? Object.keys(solutions[year]).map((k) => [
                Number(k),
                solutions[year][Number(k)].dayName,
              ])
            : []
        )
      );
  }

  constructor() {}

  registerSolution(
    year: number,
    day: number,
    dayName: string,
    service: ISolutionService,
    additionalInfo: string = ''
  ) {
    if (day < 1 || day > 25) {
      throw new Error(`Cannot register solution for day ${day}!`);
    }
    var solutionsObj = this.availableSolutions.value;
    if (!(year in solutionsObj)) {
      solutionsObj[year] = {};
    }
    if (day in solutionsObj) {
      throw new Error(
        `Solutions for Year ${year}, Day ${day} has already been registered!`
      );
    }
    solutionsObj[year][day] = { dayName, additionalInfo, service };
    this.availableSolutions.next(solutionsObj);
  }
}
