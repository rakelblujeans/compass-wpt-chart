import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'; // <-- NgModel lives here
import { RouterModule, Routes } from '@angular/router';

import { DpDatePickerModule } from 'ng2-date-picker';
import { ChartsModule } from 'ng2-charts';
import { MomentModule } from 'angular2-moment';

import { AppComponent } from './app.component';
import { ChartComponent } from './chart/chart.component';

const appRoutes: Routes = [
  { path: '', redirectTo: 'chart', pathMatch: 'full' },
  { path: 'chart', component: ChartComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    ChartComponent,
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      // { enableTracing: true } // <-- debugging purposes only
    ),
    BrowserModule,
    FormsModule,
    ChartsModule,
    DpDatePickerModule,
    MomentModule,
  ],
  providers: [],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
