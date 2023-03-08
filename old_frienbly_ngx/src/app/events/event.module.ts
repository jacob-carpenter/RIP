import { NgModule } from '@angular/core';

import { AppCommonModule } from '../common/app-common.module';

import { EventAttendeeDialog } from './components/card/attendee-dialog/event-attendee.dialog';
import { EventCardDialogComponent } from './components/dialogs/event-card.dialog';
import { EventCardComponent } from './components/card/event-card.component';
import { EventLeftMenuComponent } from './viewport/left-menu/event.left-menu.component';
import { EventViewportComponent } from './viewport/event-viewport.component';
import { EventDashboardComponent } from './viewport/dashboard/event-dashboard.component';
import { EventSettingsDialogComponent } from './components/settings-dialog/event-settings-dialog.component';
import { GeneralInformationComponent } from './components/settings-dialog/general-information/general-information.component';

@NgModule({
  imports: [
    AppCommonModule
  ],
  declarations: [
    EventLeftMenuComponent,
    EventViewportComponent,
    EventSettingsDialogComponent,
    GeneralInformationComponent,
    EventDashboardComponent,
    EventCardComponent,
    EventCardDialogComponent,
    EventAttendeeDialog
  ],
  entryComponents: [
    EventSettingsDialogComponent,
    EventCardDialogComponent,
    EventAttendeeDialog
  ],
  providers: [],
  exports: [
    EventLeftMenuComponent,
    EventViewportComponent,
    EventSettingsDialogComponent,
    GeneralInformationComponent,
    EventDashboardComponent,
    EventCardComponent,
    EventCardDialogComponent,
    EventAttendeeDialog
  ]
})
export class EventModule { }
