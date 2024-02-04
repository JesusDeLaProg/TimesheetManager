import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetTableHeaderComponent } from './timesheet-table-header.component';

describe('TimesheetTableHeaderComponent', () => {
  let component: TimesheetTableHeaderComponent;
  let fixture: ComponentFixture<TimesheetTableHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimesheetTableHeaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TimesheetTableHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
