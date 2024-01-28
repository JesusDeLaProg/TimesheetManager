import { Component } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ITimesheet } from '../../../../../../types/models/datamodels';

const timesheet: ITimesheet = {
  user: 'Maxime Charland',
  begin: new Date(2024, 0, 7),
  end: new Date(2024, 0, 20),
  lines: [
    {
      project: '24-01: Premier projet',
      phase: 'AD',
      activity: 'GE',
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
        { date: new Date(2024, 0, 20), time: 0 }
      ]
    },
    {
      project: '24-02: Deuxième projet',
      phase: 'SU',
      activity: 'AS',
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
        { date: new Date(2024, 0, 20), time: 0 }
      ]
    }
  ],
  roadsheetLines: []
}

@Component({
  selector: 'tm-timesheet-table',
  standalone: true,
  imports: [MatTableModule],
  template: `
    <table mat-table [dataSource]="data" class="mat-elevation-z8">
      <ng-container matColumnDef="project">
        <th mat-header-cell *matHeaderCellDef>Projet</th>
        <td mat-cell *matCellDef="let line">{{line.project}}</td>
      </ng-container>
      <ng-container matColumnDef="phase">
        <th mat-header-cell *matHeaderCellDef>Phase</th>
        <td mat-cell *matCellDef="let line">{{line.phase}}</td>
      </ng-container>
      <ng-container matColumnDef="activity">
        <th mat-header-cell *matHeaderCellDef>Projet</th>
        <td mat-cell *matCellDef="let line">{{line.activity}}</td>
      </ng-container>
      <ng-container matColumnDef="divers">
        <th mat-header-cell *matHeaderCellDef>Projet</th>
        <td mat-cell *matCellDef="let line">{{line.divers}}</td>
      </ng-container>
      @for(num of entryNums; track num) {
        <ng-container matColumnDef="entry-{{num}}">
          <th mat-header-cell *matHeaderCellDef="let row">{{dates[num]}}</th>
          <td mat-cell *matCellDef="let row">{{row.entries[num].time}}</td>
        </ng-container>
      }

      <tr mat-header-row *matHeaderRowDef="columnsToDisplay"></tr>
      <tr mat-row *matRowDef="let row; columns: columnsToDisplay;"></tr>
    </table>
  `,
  styles: ``
})
export class TimesheetTableComponent {
  data = new MatTableDataSource(timesheet.lines);
  entryNums = timesheet.lines[0].entries.map((e, i) => i);
  dates = timesheet.lines[0].entries.map((e, i) => new Date(2024, 0, timesheet.begin.getDay() + i));
  columnsToDisplay = ['project', 'phase', 'activity', 'divers', ...this.entryNums.map(e => 'entry-' + e)];
}
