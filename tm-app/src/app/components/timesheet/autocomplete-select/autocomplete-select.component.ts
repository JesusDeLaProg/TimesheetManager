import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Observable, Subject, Subscription, filter, fromEvent, map, merge, startWith } from 'rxjs';
import { IActivity, IPhase, IProject, ProjectType } from '../../../../../../types/models/datamodels';
import { AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

const template = `
  <mat-form-field subscriptSizing="dynamic">
    <input #input
           type="text"
           matInput
           [disabled]="disabled"
           [matAutocomplete]="auto"
           [(ngModel)]="inputValue"
           (input)="handleDelete($event)">
    <mat-autocomplete autoActiveFirstOption
                      #auto="matAutocomplete"
                      [displayWith]="displayOption">
      @for (option of filteredOptions | async; track option) {
        <mat-option [value]="option">{{displayOption(option)}}</mat-option>
      }
    </mat-autocomplete>
    @if (selected && showClearButton) {
      <button matSuffix mat-icon-button aria-label="Clear" (click)="clearSelection()">
        <mat-icon>close</mat-icon>
      </button>
    }
  </mat-form-field>
`;

const styles = `
  :host {
    display: flex;
  }

  mat-form-field {
    width: 100%;
  }
`;

@Component({
  selector: 'tm-autocomplete-select',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
  ],
  template,
  styles
})
export abstract class AutocompleteSelectComponent<T extends { _id?: string }> implements AfterViewInit, OnInit, OnDestroy {
  @Input() disabled: boolean = false;
  @Input() value?: string;
  @Output() valueChange = new EventEmitter<string>();
  $selectionChange?: Subscription;
  inputValue: string | T = '';
  filteredOptions!: Observable<T[]>;
  forcedInput = new Subject<string | T>();
  selected?: MatOption;
  showClearButton: boolean = true;

  @ViewChild('input', { static: true }) input!: ElementRef;
  @ViewChild(MatAutocompleteTrigger, { static: true }) autocomplete!: MatAutocompleteTrigger;

  ngOnInit() {
    const merged = merge(
      fromEvent(this.input.nativeElement, 'input', (e: any) => e.target.value),
      this.forcedInput.asObservable(),
      this.autocomplete.optionSelections.pipe(
        filter(c => c.source.selected),
        map(c => c.source.value)
      )
    ).pipe(
      startWith(''),
      map(value => this.filter(value || ''))
    );
    this.filteredOptions = merged;
    this.$selectionChange = this.autocomplete.optionSelections.subscribe(
      change => {
        if (this.selected === change.source || change.source.selected) {
          this.selected = change.source.selected ? change.source : undefined;
          this.valueChange.emit((this.selected?.value as T)._id || '');
        }
      }
    );
  }

  ngAfterViewInit() {
    window.setTimeout(() => this.initializeSelection());
  }

  ngOnDestroy() {
    this.$selectionChange?.unsubscribe();
  }

  initializeSelection() {
    const chosenOption = this.autocomplete.autocomplete.options.find(
      option => (option.value as T)._id === this.value);
      if (chosenOption) {
        this.selected = chosenOption;
        this.inputValue = chosenOption.value;
        chosenOption.select();
        this.forcedInput.next(this.selected.value);
      }
  }

  displayOption(option?: T) {
    return '';
  }

  handleDelete(event: Event) {
    if (this.selected &&
      (event as InputEvent).inputType.startsWith('delete')) {
      this.clearSelection();
    }
  }

  clearSelection() {
    this.inputValue = '';
    this.autocomplete.activeOption?.deselect();
    this.forcedInput.next('');
    this.valueChange.next('');
    this.selected = undefined;
  }

  protected filter(value: string | T): T[] {
    return [];
  }
}

@Component({
  selector: 'tm-project-autocomplete-select',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
  ],
  template,
  styles
})
export class ProjectAutocompleteSelectComponent extends AutocompleteSelectComponent<IProject> {

  allOptions: IProject[] = [
    { _id: '19-01', code: '19-01', name: 'Premier projet', type: ProjectType.PUBLIC, client: 'Client 1', isActive: true },
    { _id: '23-01', code: '23-01', name: 'Deuxième projet', type: ProjectType.PUBLIC, client: 'Client 1', isActive: true },
    { _id: '24-01', code: '24-01', name: 'Troisième projet', type: ProjectType.PUBLIC, client: 'Client 1', isActive: true },
    { _id: '24-02', code: '24-02', name: 'Quatrième projet', type: ProjectType.PUBLIC, client: 'Client 1', isActive: true },
  ];

  override displayOption(option?: IProject) {
    return option ? `${option.code} - ${option.name}` : '';
  }

  protected override filter(value: string): IProject[] {
    return this.allOptions.filter(p => p.code.startsWith(value));
  }
}

@Component({
  selector: 'tm-phase-autocomplete-select',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
  ],
  template,
  styles
})
export class PhaseAutocompleteSelectComponent extends AutocompleteSelectComponent<IPhase> {
  override showClearButton: boolean = false;

  allOptions: IPhase[] = [
    { _id: '1111', code: 'PH1', name: 'Phase 1', activities: ['aaaa', 'bbbb', 'cccc', 'dddd'] },
    { _id: '2222', code: 'PH2', name: 'Phase 2', activities: ['aaaa', 'bbbb', 'cccc'] },
    { _id: '3333', code: 'PH3', name: 'Phase 3', activities: ['bbbb', 'cccc'] },
    { _id: '4444', code: 'PH4', name: 'Phase 4', activities: ['dddd'] },
  ];

  override displayOption(option?: IPhase) {
    return option?.code ? option.code : '';
  }

  protected override filter(value: string | IPhase): IPhase[] {
    return typeof value === 'string' ? this.allOptions.filter(p => p.code.startsWith(value)) : [value];
  }
}

@Component({
  selector: 'tm-activity-autocomplete-select',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
  ],
  template,
  styles
})
export class ActivityAutocompleteSelectComponent extends AutocompleteSelectComponent<IActivity> {
  override showClearButton: boolean = false;

  private _chosenPhase?: string;

  @Input() set chosenPhase(p: string | undefined) {
    this._chosenPhase = p;
    this.forcedInput.next(this.inputValue);
  }

  allPhases: IPhase[] = [
    { _id: '1111', code: 'PH1', name: 'Phase 1', activities: ['aaaa', 'bbbb', 'cccc', 'dddd'] },
    { _id: '2222', code: 'PH2', name: 'Phase 2', activities: ['aaaa', 'bbbb', 'cccc'] },
    { _id: '3333', code: 'PH3', name: 'Phase 3', activities: ['bbbb', 'cccc'] },
    { _id: '4444', code: 'PH4', name: 'Phase 4', activities: ['dddd'] },
  ];

  allOptions: IActivity[] = [
    { _id: 'aaaa', code: 'A1', name: 'Activité 1' },
    { _id: 'bbbb', code: 'A2', name: 'Activité 2' },
    { _id: 'cccc', code: 'A3', name: 'Activité 3' },
    { _id: 'dddd', code: 'A4', name: 'Activité 4' },
  ];

  override displayOption(option?: IActivity) {
    return option?.code ? option.code : '';
  }

  protected override filter(value: string | IActivity): IActivity[] {
    if (typeof value === 'string') {
      const phase = this._chosenPhase ? this.allPhases.find(p => this._chosenPhase === p._id) : null;
      return phase ? this.allOptions.filter(a => a.code.startsWith(value) && phase.activities.includes(a._id as string)) : [];
    }
    return [value];
    
  }
}
