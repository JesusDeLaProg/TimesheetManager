import { Component, ElementRef, Input, OnInit, ViewChild, computed, signal } from '@angular/core';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ITimesheet, ITimesheetLine } from '../../../../../../types/models/datamodels';
import { AsyncPipe, DatePipe, NgClass, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TimesheetTableHeaderComponent } from '../timesheet-table-header/timesheet-table-header.component';
import { ActivityAutocompleteSelectComponent, PhaseAutocompleteSelectComponent, ProjectAutocompleteSelectComponent } from '../autocomplete-select/autocomplete-select.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DateTime } from 'luxon';
import { Observable, fromEvent, map } from 'rxjs';

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
    NgIf,
    FormsModule,
    ActivityAutocompleteSelectComponent,
    PhaseAutocompleteSelectComponent,
    ProjectAutocompleteSelectComponent,
    TimesheetTableHeaderComponent,
  ],
  template: `
    <div #container class="mat-elevation-z8 container">
      <div class="content">
        <tm-timesheet-table-header style="position: sticky; left: 0;" [timesheet]="_timesheet()"/>
        <table mat-table [dataSource]="data()">
          <ng-container matColumnDef="project" sticky>
            <th mat-header-cell *matHeaderCellDef>Projet</th>
            <td mat-cell *matCellDef="let line">
              <div class="project-cell">
                @if(line.project) {
                  <button class="small" mat-icon-button (click)="deleteLine(line)">
                    <mat-icon class="shadow">delete</mat-icon>
                  </button>
                } @else {
                  <div style="width: 24px; height: 24px; margin-right: 5px;"></div>
                }
                <tm-project-autocomplete-select [(value)]="line.project" (valueChange)="projectChanged($event)" />
              </div>
            </td>
            <td class="last-sticky-cell" [ngClass]="((containerScroll | async) ?? 0) > 0 ? 'mat-elevation-z4' : ''"
              colspan="3" *matFooterCellDef style="background-color: white; padding-left: 16px; padding-right: 16px;">
              <div style="align-content: flex-end" class="project-footer"><b>Total:</b></div>
            </td>
          </ng-container>
          <ng-container matColumnDef="phase" sticky>
            <th mat-header-cell *matHeaderCellDef>Phase</th>
            <td mat-cell *matCellDef="let line" style="width: 110px">
              <tm-phase-autocomplete-select [disabled]="!line.project" [(value)]="line.phase" />
            </td>
            <td *matFooterCellDef></td>
          </ng-container>
          <ng-container matColumnDef="activity" sticky>
            <th class="last-sticky-cell" [ngClass]="((containerScroll | async) ?? 0) > 0 ? 'mat-elevation-z4' : ''"
              mat-header-cell *matHeaderCellDef>Activité</th>
            <td class="last-sticky-cell" [ngClass]="((containerScroll | async) ?? 0) > 0 ? 'mat-elevation-z4' : ''"
              mat-cell *matCellDef="let line" style="width: 110px">
              <tm-activity-autocomplete-select [disabled]="!line.project" [chosenPhase]="line.phase" [(value)]="line.activity" />
            </td>
            <td *matFooterCellDef></td>
          </ng-container>
          <ng-container matColumnDef="divers">
            <th mat-header-cell *matHeaderCellDef>Divers</th>
            <td mat-cell *matCellDef="let line">
              <div class="divers-cell">
                <input class="rounded shadow"
                  [disabled]="!line.project"
                  [(ngModel)]="line.divers">
              </div>
            </td>
            <td *matFooterCellDef></td>
          </ng-container>
          @for(col of daysColumns; track col; let i = $index) {
            <ng-container matColumnDef="{{col}}">
              <th mat-header-cell *matHeaderCellDef>{{dates()[i] | date:"d MMM"}}</th>
              <td mat-cell *matCellDef="let line">
                <div class="entry-cell">
                  <input class="rounded shadow" type="number" min="0"
                    [disabled]="!line.project"
                    (focus)="entryInputFocused($event)"
                    [(ngModel)]="line.entries[i].time">
                </div>
              </td>
              <td class="day-total" *matFooterCellDef><b>{{getTotalHourForDay(i)}}</b></td>
            </ng-container>
          }

          <ng-container matColumnDef="week-total-0">
            <th mat-header-cell *matHeaderCellDef></th>
            <td style="text-align: center;" mat-cell *matCellDef="let line"><b *ngIf="line.project">{{getWeekTotal(0, line)}}</b></td>
            <td style="text-align: center;" mat-footer-cell *matFooterCellDef><b>{{getWeekTotal(0)}}</b></td>
          </ng-container>
          <ng-container matColumnDef="week-total-1">
            <th mat-header-cell *matHeaderCellDef></th>
            <td style="text-align: center;" mat-cell *matCellDef="let line"><b *ngIf="line.project">{{getWeekTotal(1, line)}}</b></td>
            <td style="text-align: center;" mat-footer-cell *matFooterCellDef><b>{{getWeekTotal(1)}}</b></td>
          </ng-container>
          <ng-container matColumnDef="total">
            <th mat-header-cell *matHeaderCellDef>Total</th>
            <td style="text-align: center;" mat-cell *matCellDef="let line"><b *ngIf="line.project">{{getLineTotal(line)}}</b></td>
            <td style="text-align: center;" mat-footer-cell *matFooterCellDef><b>{{getTimesheetTotal()}}</b></td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columnsToDisplay"></tr>
          <tr mat-row *matRowDef="let row; columns: columnsToDisplay;"></tr>
          <tr mat-footer-row *matFooterRowDef="footerColumns"></tr>
        </table>
      </div>
    </div>
  `,
  styles: `
    @use '@angular/material' as mat;

    .last-sticky-cell {
      @include mat.elevation-transition();
      clip-path: inset(0px -50px 0px 0px);
    }

    .container {
      margin: 20px;
      padding: 20px;
      width: calc(100% - 80px);
      border-radius: 25px;

      .content {
        overflow-x: scroll;
      }

    }

    .project-cell {
      display: flex;
      width: 280px;

      tm-project-autocomplete-select {
        width: 250px;
      }

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

    .divers-cell, .entry-cell, .project-footer {
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      align-content: space-around;
    }

    .divers-cell > input {
      width: 45px;
      height: 30px;
      text-align: center;
    }

    .entry-cell > input {
      width: 30px;
      height: 30px;
      text-align: center;
    }

    .day-total {
      text-align: center;
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
  _timesheet = signal<ITimesheet>({ user: '', begin: new Date(), end: new Date(), lines: [], roadsheetLines: [] });
  @Input({ required: true }) set timesheet(t: ITimesheet) {
    this._timesheet.set(t);
    window.setTimeout(() => this.table?.renderRows(), 0);
  };
  DAYS_COUNT = 14;
  data = computed(() => new MatTableDataSource(this._timesheet()?.lines));
  dates = computed(() => {
    const t = this._timesheet();
    if (t) {
      const start = DateTime.fromJSDate(t.begin).startOf('day');
      return Array(this.DAYS_COUNT).fill(0).map((_, i) => start.plus({ day: i }).startOf('day').toJSDate());
    }
    return [];
  });
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
    return this._timesheet()?.lines.map(l => l.entries[index]).reduce((total, e) => total + e.time, 0);
  }

  getWeekTotal(i: number, line?: ITimesheetLine): number {
    if (line) {
      return line.entries.slice(i * 7, (i + 1) * 7).map(e => e.time).reduce((v, t) => v + t, 0);
    }
    return this._timesheet()?.lines.reduce((v, l) => v + this.getWeekTotal(i, l), 0) ?? 0;
  }

  getLineTotal(line: ITimesheetLine) {
    return line.entries.reduce((total, e) => total + e.time, 0);
  }

  getTimesheetTotal(): number {
    return this._timesheet()?.lines.reduce((total, l) => total + this.getLineTotal(l), 0) ?? 0;
  }

  deleteLine(line: ITimesheetLine) {
    this._timesheet.update(t => {
      t?.lines.splice(t?.lines.indexOf(line), 1);
      return t;
    });
    this.table?.renderRows();
  }

  projectChanged(newValue: string) {
    if (newValue && this._timesheet()?.lines.every(l => !!l.project)) {
      this._timesheet.update(t => {
        t?.lines.push({
          project: '',
          phase: '',
          activity: '',
          entries: Array(this.DAYS_COUNT).fill({}).map((_, i) => ({ date: DateTime.fromJSDate(t.begin).startOf('day').plus({ days: i }).toJSDate(), time: 0 })) });
        return t;
      });
      this.table?.renderRows();
    }
  }

  entryInputFocused(event: FocusEvent) {
    (event.target as HTMLInputElement)?.select();
  }
}
