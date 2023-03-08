import { NgModule } from '@angular/core';
import { ReCaptchaModule } from 'angular2-recaptcha';

import { AppCommonModule } from '../common/app-common.module';
import { MessengerModule } from '../messenger/messenger.module';
import { StaticPageModule } from '../static-pages/static-page.module';

import { UserCardComponent } from './card/user-card.component';
import { UserCardDetailsDialogComponent } from './card/details/user-card.details.dialog';
import { ReportDialogComponent } from './card/details/dialogs/report-dialog.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordDialogComponent } from './login/dialogs/forgot-password-dialog.component';
import { RegistrationComponent } from './registration/registration.component';
import { UserSettingsComponent } from './settings/user-settings.component';
import { AccountSettingsComponent } from './settings/account-settings/account-settings.component';
import { GeneralInformationComponent } from './settings/general-information/general-information.component';
import { SearchPreferencesComponent } from './settings/search-preferences/search-preferences.component';
import { UserBlockManagementDialogComponent } from './block/user-block-management.dialog.component';
import { SettingNotificationComponent } from './settings/notification/setting-notification.component';

import { RecaptchaService } from './recaptcha/recaptcha.service';
import { UserDetailsService } from './services/user-details.service';
import { ReportService } from './services/report.service';

@NgModule({
  imports: [
    AppCommonModule,
    ReCaptchaModule,
    StaticPageModule,
    MessengerModule
  ],
  declarations: [
    LoginComponent,
    RegistrationComponent,
    UserSettingsComponent,
    AccountSettingsComponent,
    GeneralInformationComponent,
    SearchPreferencesComponent,
    ForgotPasswordDialogComponent,
    UserCardComponent,
    UserCardDetailsDialogComponent,
    ReportDialogComponent,
    UserBlockManagementDialogComponent,
    SettingNotificationComponent
  ],
  entryComponents: [
    ForgotPasswordDialogComponent,
    UserCardDetailsDialogComponent,
    ReportDialogComponent,
    UserBlockManagementDialogComponent
  ],
  providers: [
    RecaptchaService,
    UserDetailsService,
    ReportService
  ],
  exports: [
    LoginComponent,
    RegistrationComponent,
    UserSettingsComponent,
    AccountSettingsComponent,
    GeneralInformationComponent,
    SearchPreferencesComponent,
    ForgotPasswordDialogComponent,
    UserCardComponent,
    UserCardDetailsDialogComponent,
    ReportDialogComponent,
    UserBlockManagementDialogComponent,
    SettingNotificationComponent
  ]
})
export class UserModule { }
