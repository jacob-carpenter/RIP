import { NgModule } from '@angular/core';

import { AppCommonModule } from '../common/app-common.module';

import { GroupCardDetailsDialogComponent } from './card/details/group-card.details.dialog';
import { GroupCardComponent } from './card/group-card.component';
import { GroupSettingsComponent } from './settings/group-settings.component';
import { GeneralInformationComponent } from './settings/general-information/general-information.component';
import { SearchPreferencesComponent } from './settings/search-preferences/search-preferences.component';

import { SettingNotificationComponent } from './settings/notification/setting-notification.component';
import {GroupMemberManagementDialogComponent} from './members/group-member-management.dialog.component';

import { GroupDetailsService } from './services/group-details.service';

@NgModule({
  imports: [
    AppCommonModule
  ],
  declarations: [
    GroupSettingsComponent,
    GeneralInformationComponent,
    SearchPreferencesComponent,
    GroupCardComponent,
    GroupCardDetailsDialogComponent,
    GroupMemberManagementDialogComponent,
    SettingNotificationComponent
  ],
  entryComponents: [
    GroupCardDetailsDialogComponent,
    GroupMemberManagementDialogComponent
  ],
  providers: [
    GroupDetailsService
  ],
  exports: [
    GroupSettingsComponent,
    GeneralInformationComponent,
    SearchPreferencesComponent,
    GroupCardComponent,
    GroupCardDetailsDialogComponent,
    GroupMemberManagementDialogComponent,
    SettingNotificationComponent
  ]
})
export class GroupModule { }
