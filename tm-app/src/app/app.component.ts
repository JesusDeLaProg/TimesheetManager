import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TimesheetTableComponent } from './components/timesheet/timesheet-table/timesheet-table.component';

@Component({
  selector: 'tm-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TimesheetTableComponent],
  template: `
    <h1>Welcome to {{title}}!</h1>

    <router-outlet></router-outlet>
    <tm-timesheet-table />
  `,
  styles: ``,
})
export class AppComponent {
  title = 'tm-app';
}
