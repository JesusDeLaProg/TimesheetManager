import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TimesheetTableComponent } from './components/timesheet/timesheet-table/timesheet-table.component';
import { ITimesheet } from '../../../types/models/datamodels';

const TIMESHEET: ITimesheet = {
  user: 'Maxime Charland',
  begin: new Date(2024, 0, 7),
  end: new Date(2024, 0, 20),
  lines: [
    {
      project: '24-01',
      phase: '1111',
      activity: 'aaaa',
      entries: [
        { date: new Date(2024, 0, 7), time: 0 },
        { date: new Date(2024, 0, 8), time: Math.round(Math.random() * 3) },
        { date: new Date(2024, 0, 9), time: Math.round(Math.random() * 3) },
        { date: new Date(2024, 0, 10), time: Math.round(Math.random() * 3) },
        { date: new Date(2024, 0, 11), time: Math.round(Math.random() * 3) },
        { date: new Date(2024, 0, 12), time: Math.round(Math.random() * 3) },
        { date: new Date(2024, 0, 13), time: 0 },
        { date: new Date(2024, 0, 14), time: 0 },
        { date: new Date(2024, 0, 15), time: Math.round(Math.random() * 3) },
        { date: new Date(2024, 0, 16), time: Math.round(Math.random() * 3) },
        { date: new Date(2024, 0, 17), time: Math.round(Math.random() * 3) },
        { date: new Date(2024, 0, 18), time: Math.round(Math.random() * 3) },
        { date: new Date(2024, 0, 19), time: Math.round(Math.random() * 3) },
        { date: new Date(2024, 0, 20), time: 0 },
      ],
    },
    {
      project: '24-02',
      phase: '3333',
      activity: 'cccc',
      entries: [
        { date: new Date(2024, 0, 7), time: 0 },
        { date: new Date(2024, 0, 8), time: Math.round(Math.random() * 3) },
        { date: new Date(2024, 0, 9), time: Math.round(Math.random() * 3) },
        { date: new Date(2024, 0, 10), time: Math.round(Math.random() * 3) },
        { date: new Date(2024, 0, 11), time: Math.round(Math.random() * 3) },
        { date: new Date(2024, 0, 12), time: Math.round(Math.random() * 3) },
        { date: new Date(2024, 0, 13), time: 0 },
        { date: new Date(2024, 0, 14), time: 0 },
        { date: new Date(2024, 0, 15), time: Math.round(Math.random() * 3) },
        { date: new Date(2024, 0, 16), time: Math.round(Math.random() * 3) },
        { date: new Date(2024, 0, 17), time: Math.round(Math.random() * 3) },
        { date: new Date(2024, 0, 18), time: Math.round(Math.random() * 3) },
        { date: new Date(2024, 0, 19), time: Math.round(Math.random() * 3) },
        { date: new Date(2024, 0, 20), time: 0 },
      ],
    },
  ],
  roadsheetLines: [],
};

@Component({
  selector: 'tm-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TimesheetTableComponent],
  template: `
    <router-outlet></router-outlet>
    <tm-timesheet-table [timesheet]="timesheet" />
  `,
  styles: ``,
})
export class AppComponent {
  timesheet = TIMESHEET;
}
