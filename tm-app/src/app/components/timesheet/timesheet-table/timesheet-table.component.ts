import { Component, ElementRef, OnInit, ViewChild, computed, signal } from '@angular/core';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ITimesheet, ITimesheetLine } from '../../../../../../types/models/datamodels';
import { AsyncPipe, DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TimesheetTableHeaderComponent } from '../timesheet-table-header/timesheet-table-header.component';
import { ActivityAutocompleteSelectComponent, PhaseAutocompleteSelectComponent, ProjectAutocompleteSelectComponent } from '../autocomplete-select/autocomplete-select.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DateTime } from 'luxon';
import { Observable, fromEvent, map } from 'rxjs';

const timesheet: ITimesheet = {
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
        { date: new Date(2024, 0, 20), time: 0 }
      ]
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
    AsyncPipe,
    DatePipe,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
    NgClass,
    FormsModule,
    ActivityAutocompleteSelectComponent,
    PhaseAutocompleteSelectComponent,
    ProjectAutocompleteSelectComponent,
    TimesheetTableHeaderComponent,
  ],
  template: `
    <div #container class="mat-elevation-z8 container">
      <tm-timesheet-table-header [timesheet]="TIMESHEET()"/>
      <table mat-table [dataSource]="data()">
        <ng-container matColumnDef="project" sticky>
          <th mat-header-cell *matHeaderCellDef>Projet</th>
          <td mat-cell *matCellDef="let line">
          <div class="project-cell">
            <button mat-icon-button (click)="deleteLine(line)"><mat-icon>delete</mat-icon></button>
            <tm-project-autocomplete-select [(value)]="line.project" />
          </div>
          </td>
          <td class="sticky-end-cell" [ngClass]="((containerScroll | async) ?? 0) > 0 ? 'mat-elevation-z12' : ''"
            colspan="3" *matFooterCellDef style="background-color: white">
            <div class="project-footer"><b>Total:</b></div>
          </td>
        </ng-container>
        <ng-container matColumnDef="phase" sticky>
          <th mat-header-cell *matHeaderCellDef>Phase</th>
          <td mat-cell *matCellDef="let line" style="width: 110px">
            <tm-phase-autocomplete-select [(value)]="line.phase" />
          </td>
          <td *matFooterCellDef></td>
        </ng-container>
        <ng-container matColumnDef="activity" sticky>
          <th class="sticky-end-cell" [ngClass]="((containerScroll | async) ?? 0) > 0 ? 'mat-elevation-z12' : ''"
            mat-header-cell *matHeaderCellDef>Activité</th>
          <td class="sticky-end-cell" [ngClass]="((containerScroll | async) ?? 0) > 0 ? 'mat-elevation-z12' : ''"
            mat-cell *matCellDef="let line" style="width: 110px">
            <tm-activity-autocomplete-select [chosenPhase]="line.phase" [(value)]="line.activity" />
          </td>
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
        @for(col of daysColumns; track col; let i = $index) {
          <ng-container matColumnDef="{{col}}">
            <th mat-header-cell *matHeaderCellDef>{{dates[i] | date:"d MMM"}}</th>
            <td mat-cell *matCellDef="let line">
              <div class="entry-cell">
                <input class="entry-time" type="number" min="0"
                  [(ngModel)]="line.entries[i].time">
              </div>
            </td>
            <td class="day-total" *matFooterCellDef><b>{{getTotalHourForDay(i)}}</b></td>
          </ng-container>
        }

        <ng-container matColumnDef="week-total-0">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let line"><b>{{getWeekTotal(0, line)}}</b></td>
          <td mat-footer-cell *matFooterCellDef><b>{{getWeekTotal(0)}}</b></td>
        </ng-container>
        <ng-container matColumnDef="week-total-1">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let line"><b>{{getWeekTotal(1, line)}}</b></td>
          <td mat-footer-cell *matFooterCellDef><b>{{getWeekTotal(1)}}</b></td>
        </ng-container>
        <ng-container matColumnDef="total">
          <th mat-header-cell *matHeaderCellDef>Total</th>
          <td mat-cell *matCellDef="let line"><b>{{getLineTotal(line)}}</b></td>
          <td mat-footer-cell *matFooterCellDef><b>{{getTimesheetTotal()}}</b></td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="columnsToDisplay"></tr>
        <tr mat-row *matRowDef="let row; columns: columnsToDisplay;"></tr>
        <tr mat-footer-row *matFooterRowDef="footerColumns"></tr>
      </table>
    </div>
  `,
  styles: `
    @use '@angular/material' as mat;

    .sticky-end-cell {
      @include mat.elevation-transition();
      clip-path: inset(0px -50px 0px 0px);
    }

    .container {
      width: 100%;
      overflow-x: scroll;

      &.scrolled {
        .sticky-end-cell {
          box-shadow: 0px 0px 10px 2px rgba(0,0,0,0.5);
        }
      }
    }

    .project-cell {
      display: flex;

      button[mat-icon-button] {
        color: #777;
        margin-top: auto;
        margin-bottom: auto;
        margin-right: 5px;

        &:hover {
          color: #700;
        }
      }
    }

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
      border-radius: 5px;
      border-style: none;
      border-color: white;
      -webkit-box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.5); 
      box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.5);
    }

    .entry-time {
      width: 30px;
      height: 30px;
      text-align: center;
      border-radius: 5px;
      border-style: none;
      border-color: white;
      -webkit-box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.5); 
      box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.5);
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

    th {
      text-align: center;

      &:first-of-type {
        text-align: start;
      }
    }

    tm-phase-autocomplete-select, tm-activity-autocomplete-select {
      width: 100px;
      margin: 5px;
    }
  `
})
export class TimesheetTableComponent implements OnInit {
  TIMESHEET = signal(timesheet);
  DAYS_COUNT = 14;
  data = computed(() => new MatTableDataSource(this.TIMESHEET().lines));
  dates = (() => {
    const start = DateTime.fromJSDate(this.TIMESHEET().begin).startOf('day');
    return Array(this.DAYS_COUNT).fill(0).map((_, i) => start.plus({ day: i }).startOf('day').toJSDate());
  })();
  headerColumns = ['project', 'phase', 'activity', 'divers'];
  daysColumns = Array(this.DAYS_COUNT).fill(0).map((_, i) => `entry-${i}`);
  columnsToDisplay = (() => {
    const cols = this.headerColumns;
    for (let i = 0; i < Math.ceil(this.DAYS_COUNT / 7); ++i) {
      const week = this.daysColumns.slice(i * 7, (i + 1) * 7);
      cols.push(...week);
      if (week.length === 7) {
        cols.push('week-total-' + i);
      }
    }
    return [...cols, 'total'];
  })();
  footerColumns = [this.columnsToDisplay[0], ...this.columnsToDisplay.slice(3)];

  @ViewChild(MatTable, { static: true }) table?: MatTable<ITimesheetLine>;
  @ViewChild('container', { static: true }) containerDiv?: ElementRef;
  containerScroll?: Observable<any>;

  ngOnInit(): void {
    this.containerScroll = fromEvent<Event>(this.containerDiv?.nativeElement, 'scroll')
      .pipe(map((e: Event) => (e.target as Element).scrollLeft));
  }

  getTotalHourForDay(index: number) {
    return this.TIMESHEET().lines.map(l => l.entries[index]).reduce((total, e) => total + e.time, 0);
  }

  getLineTotal(line: ITimesheetLine) {
    return line.entries.reduce((total, e) => total + e.time, 0);
  }

  getWeekTotal(i: number, line?: ITimesheetLine): number {
    if (line) {
      return line.entries.slice(i * 7, (i + 1) * 7).map(e => e.time).reduce((v, t) => v + t, 0);
    }
    return this.TIMESHEET().lines.reduce((v, l) => v + this.getWeekTotal(i, l), 0);
  }

  getTimesheetTotal() {
    return this.TIMESHEET().lines.reduce((total, l) => total + this.getLineTotal(l), 0);
  }

  deleteLine(line: ITimesheetLine) {
    this.TIMESHEET.update(t => {
      t.lines.splice(this.TIMESHEET().lines.indexOf(line), 1);
      return t;
    });
    this.table?.renderRows();
  }
}
