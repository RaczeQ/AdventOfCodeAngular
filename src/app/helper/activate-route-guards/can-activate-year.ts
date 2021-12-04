import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { SolutionsCollectorService } from '../services/solutions-collector.service';

@Injectable()
export class CanActivateYear implements CanActivate {
  availableYears: number[] = [];
  constructor(
    private solutionsCollectorService: SolutionsCollectorService,
    private router: Router
  ) {
    solutionsCollectorService
      .getAvailableYearsObservable()
      .subscribe((years) => (this.availableYears = years));
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
    var result =
      year && this.isInt(year) && this.availableYears.includes(yearNumber);
    if (!result) {
      this.router.navigate(['/']);
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
