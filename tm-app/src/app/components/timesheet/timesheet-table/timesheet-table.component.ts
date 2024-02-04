import { Component } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ITimesheet, ITimesheetLine } from '../../../../../../types/models/datamodels';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TimesheetTableHeaderComponent } from '../timesheet-table-header/timesheet-table-header.component';

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
  imports: [
    DatePipe,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    FormsModule,
    TimesheetTableHeaderComponent,
  ],
  template: `
    <div class="mat-elevation-z8">
      <tm-timesheet-table-header [timesheet]="TIMESHEET"/>
      <table mat-table [dataSource]="data">
        <ng-container matColumnDef="project">
          <th mat-header-cell *matHeaderCellDef>Projet</th>
          <td mat-cell *matCellDef="let line">{{line.project}}</td>
          <td *matFooterCellDef><div class="project-footer"><b>Total:</b></div></td>
        </ng-container>
        <ng-container matColumnDef="phase">
          <th mat-header-cell *matHeaderCellDef>Phase</th>
          <td mat-cell *matCellDef="let line">{{line.phase}}</td>
          <td *matFooterCellDef></td>
        </ng-container>
        <ng-container matColumnDef="activity">
          <th mat-header-cell *matHeaderCellDef>Activité</th>
          <td mat-cell *matCellDef="let line">{{line.activity}}</td>
          <td *matFooterCellDef></td>
        </ng-container>
        <ng-container matColumnDef="divers">
          <th mat-header-cell *matHeaderCellDef>Divers</th>
          <td mat-cell *matCellDef="let line">
            <div class="divers-cell">
              <input class="divers-input"
                [(ngModel)]="line.divers">
            </div>
          </td>
          <td *matFooterCellDef></td>
        </ng-container>
        @for(num of entryNums; track num) {
          <ng-container matColumnDef="entry-{{num}}">
            <th mat-header-cell *matHeaderCellDef>{{data.data[0].entries[num].date | date:"d MMM"}}</th>
            <td mat-cell *matCellDef="let line">
              <div class="entry-cell">
                <input class="entry-time" type="number" min="0"
                  [(ngModel)]="line.entries[num].time">
              </div>
            </td>
            <td class="day-total" *matFooterCellDef><b>{{getTotalHourForDay(num)}}</b></td>
          </ng-container>
        }

        <ng-container matColumnDef="total">
          <th mat-header-cell *matHeaderCellDef>Total</th>
          <td mat-cell *matCellDef="let line"><b>{{getLineTotal(line)}}</b></td>
          <td mat-footer-cell *matFooterCellDef><b>{{getTimesheetTotal()}}</b></td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="columnsToDisplay"></tr>
        <tr mat-row *matRowDef="let row; columns: columnsToDisplay;"></tr>
        <tr mat-footer-row *matFooterRowDef="columnsToDisplay"></tr>
      </table>
    </div>
  `,
  styles: `
    .project-footer {
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      align-content: space-around;
    }

    .divers-cell, .entry-cell {
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      align-content: space-around;
    }

    .divers-input {
      width: 45px;
      height: 30px;
      text-align: center;
    }

    .entry-time {
      width: 30px;
      height: 30px;
      text-align: center;
    }

    .day-total {
      text-align: center;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    input[type=number] {
      -moz-appearance: textfield;
    }
  `
})
export class TimesheetTableComponent {
  TIMESHEET = timesheet;
  data = new MatTableDataSource(timesheet.lines);
  entryNums = timesheet.lines[0].entries.map((e, i) => i);
  dates = timesheet.lines[0].entries.map((e, i) => new Date(2024, 0, timesheet.begin.getDay() + i));
  columnsToDisplay = ['project', 'phase', 'activity', 'divers', ...this.entryNums.map(e => 'entry-' + e), 'total'];

  getTotalHourForDay(index: number) {
    return timesheet.lines.map(l => l.entries[index]).reduce((total, e) => total + e.time, 0);
  }

  getLineTotal(line: ITimesheetLine) {
    return line.entries.reduce((total, e) => total + e.time, 0);
  }

  getTimesheetTotal() {
    return timesheet.lines.reduce((total, l) => total + this.getLineTotal(l), 0);
  }
}
