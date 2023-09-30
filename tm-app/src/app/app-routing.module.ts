import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OldHomeComponent } from './old-home/old-home.component';

const routes: Routes = [
  { path: 'help', component: OldHomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
