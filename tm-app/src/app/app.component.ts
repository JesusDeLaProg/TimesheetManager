import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TimesheetTableComponent } from './components/timesheet/timesheet-table/timesheet-table.component';
import { ITimesheet } from '../../../types/models/datamodels';
import { AuthService } from './services/auth.service';
import { TimesheetService } from './services/timesheet.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'tm-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TimesheetTableComponent],
  template: `
    <router-outlet></router-outlet>
    @if(timesheet) {
      <tm-timesheet-table [timesheet]="timesheet" />
    }
  `,
  styles: ``,
})
export class AppComponent {
  timesheet?: ITimesheet;

  constructor(authService: AuthService, timesheetService: TimesheetService) {
    authService.login('admin', 'admin').then(console.log).then(() => {
      firstValueFrom(timesheetService.get({})).then((ts) => {
        this.timesheet = ts[0];
        timesheetService.validate(this.timesheet).then(console.log);
      });
    });
  }
}
