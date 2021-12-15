import { Component } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';

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
  constructor(private router: Router) {
    router.events.subscribe((event) => {
      if (event instanceof ActivationEnd) {
        this.selectedYear = Number(event.snapshot.params["year"]);
        this.selectedDay = Number(event.snapshot.params["day"]);
        if (this.selectedDay) {
          this.actionName = 'Go back'
        } else if (this.selectedYear) {
          this.actionName = 'Select day';
        } else {
          this.actionName = 'Select year';
        }
      }
    });
  }
}
