import { NgModule } from '@angular/core';

import { AppCommonModule } from '../common/app-common.module';
import { ViewportModule } from '../viewport/viewport.module';

import { DashboardComponent } from './dashboard-page.component';

@NgModule({
  imports: [
    AppCommonModule,
    ViewportModule
  ],
  declarations: [
    DashboardComponent
  ],
  exports: [
    DashboardComponent
  ]
})
export class DashboardModule { }
