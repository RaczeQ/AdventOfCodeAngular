import { Component } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';

@Component({
  selector: 'aoc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'AdventOfCode';
  selectedYear: string = '';
  selectedDay: string = '';
  actionName: string = '';
  constructor(private router: Router) {
    router.events.subscribe((event) => {
      if (event instanceof ActivationEnd) {
        this.selectedYear = event.snapshot.params["year"];
        this.selectedDay = event.snapshot.params["day"];
        if (this.selectedDay) {
          this.actionName = ''
        } else if (this.selectedYear) {
          this.actionName = 'Select day';
        } else {
          this.actionName = 'Select year';
        }
      }
    });
  }
}
