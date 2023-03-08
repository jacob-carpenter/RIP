import { NgModule } from '@angular/core';

import { AppCommonModule } from '../common/app-common.module';
import { UserModule } from '../user/user.module';

import { SplashComponent } from './splash-page.component';
import { EmailVerificationComponent } from './verification/email-verification.component';
import { ChangePasswordDialogComponent } from './verification/dialogs/change-password/change-password-dialog.component';

import { SplashStatusService } from './services/splash-status.service';

@NgModule({
  imports: [
    AppCommonModule,
    UserModule
  ],
  declarations: [
    SplashComponent,
    EmailVerificationComponent,
    ChangePasswordDialogComponent
  ],
  entryComponents: [
    ChangePasswordDialogComponent
  ],
  providers: [
    SplashStatusService
  ],
  exports: [
    SplashComponent,
    EmailVerificationComponent,
    ChangePasswordDialogComponent
  ]
})
export class SplashModule { }
