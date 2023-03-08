import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';

import { AppCommonModule } from './common/app-common.module';
import { RoutingModule } from './routes/routing.module';

@NgModule({
  imports: [
    AppCommonModule,
    RoutingModule
  ],
  declarations: [
    AppComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
