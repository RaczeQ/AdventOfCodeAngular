import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import {
  AvailableSolutions,
  SolutionsCollectorService,
} from '../services/solutions-collector.service';

@Injectable()
export class CanActivateDay implements CanActivate {
  availableSolutions: AvailableSolutions = {};
  constructor(
    private solutionsCollectorService: SolutionsCollectorService,
    private router: Router
  ) {
    solutionsCollectorService
      .getAvailableSolutionsObservable()
      .subscribe((solutions) => (this.availableSolutions = solutions));
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    var year = route.params['year'];
    var yearNumber = Number(year);
    var day = route.params['day'];
    var dayNumber = Number(day);
    var result =
      day &&
      this.isInt(day) &&
      yearNumber in this.availableSolutions &&
      dayNumber in this.availableSolutions[yearNumber];
    if (!result) {
      this.router.navigate(['/', yearNumber]);
    }
    return result;
  }

  isInt(value: any) {
    return (
      !isNaN(value) &&
      parseInt(Number(value).toString()) == value &&
      !isNaN(parseInt(value, 10))
    );
  }
}
