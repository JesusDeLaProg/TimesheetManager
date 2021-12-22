import { Component, OnInit } from '@angular/core';

interface Timesheet {
  
}

@Component({
  selector: 'tm-timesheet-list',
  templateUrl: './timesheet-list.component.html',
  styleUrls: ['./timesheet-list.component.scss']
})
export class TimesheetListComponent implements OnInit {

  timesheets = [

  ]

  constructor() { }

  ngOnInit(): void {
  }

}
