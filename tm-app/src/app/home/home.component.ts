import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'tm-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  users = [
    'François Charland',
    'Maxime Charland',
    'Luc Robillard',
    'Employé 1',
    'Employé 2',
    'Employé 3',
    'Employé 4',
    'Employé 5',
    'Employé 6',
    'Employé 7',
    'Employé 8',
    'Employé 9',
    'Employé 10',
    'Employé 11',
    'Employé 12',
    'Employé 13'
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
