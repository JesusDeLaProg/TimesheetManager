import { Component, Input, input } from '@angular/core';
import { ITimesheet } from '../../../../../../types/models/datamodels';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { AutocompleteSelectComponent } from '../autocomplete-select/autocomplete-select.component';

@Component({
  selector: 'tm-timesheet-table-header',
  standalone: true,
  imports: [
    AutocompleteSelectComponent,
    FormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <div class="layout">
      <mat-form-field>
        <mat-label>Employé</mat-label>
        <input matInput [(ngModel)]="timesheet.user" required>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Période*</mat-label>
        <mat-date-range-input [rangePicker]="picker">
          <input matStartDate [(ngModel)]="timesheet.begin" required>
          <input matEndDate [(ngModel)]="timesheet.end" required>
        </mat-date-range-input>
        <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-date-range-picker #picker></mat-date-range-picker>
      </mat-form-field>
      <tm-autocomplete-select />
    </div>
  `,
  styles: `
    .layout {
      padding: 10px;
    }

    mat-form-field {
      margin-right: 10px;
    }
  `
})
export class TimesheetTableHeaderComponent {
  @Input({ required: true }) timesheet!: ITimesheet;
}
