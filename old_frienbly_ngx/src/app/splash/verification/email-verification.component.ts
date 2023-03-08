import {Injectable, Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material';

import {VerificationService} from '../../common/services/verification/verification.service';
import {VerificationToken, VerificationTokenType} from '../../common/contracts/tokens/verification/verification.token';
import {ChangePasswordDialogComponent} from './dialogs/change-password/change-password-dialog.component';

import {ConfirmationDialogComponent} from '../../common/components/dialogs/confirmation/confirmation-dialog.component';

import {SplashStatusService} from '../services/splash-status.service';

import {environment} from '../../../environments/environment';

@Component({
  template: '<div><mat-spinner *ngIf="loading" color="primary" align="center"></mat-spinner></div>'
})
@Injectable()
export class EmailVerificationComponent implements OnInit {
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private verificationService: VerificationService,
    private router: Router,
    private dialog: MatDialog,
    private splashStatusService: SplashStatusService
  ) {}

  public ngOnInit() {
    this.loading = true;
    this.route.queryParams.filter(params => params.token).subscribe(params => {
      var token = params.token;

      this.verificationService.get(token).subscribe(
        (tokenResponse) => {
          if (tokenResponse.tokenType == VerificationTokenType.ACCOUNT) {
            this.handleAccountVerification(token);
          }
          if (tokenResponse.tokenType == VerificationTokenType.FORGOT_PASSWORD) {
            this.handleForgotPasswordVerification(token);
          }
          if (tokenResponse.tokenType == VerificationTokenType.CHANGE_EMAIL) {
            this.handleChangeEmailVerification(token);
          }
        },
        (error) => {
          console.debug(error);
          this.navigateToRoot();
        }
      )

    });
  }

  private handleAccountVerification(token: string) {
    this.verificationService.verifyAccount(token).subscribe(
      (response) => {
        this.splashStatusService.userLoggedIn();

        this.loading = false;
        let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
          width: environment.dialogs.width,
          data: {
            titleText: 'Email Verified',
            bodyText: response ? 'Your account has been activated!' : 'We failed to activate your account. Unverified accounts are removed after 24 hours without email verification.',
            closeButtonText: 'Ok'
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          this.navigateToRoot();
        });
      },
      (error) => {
        console.debug(error);
        this.loading = false;
        let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
          width: environment.dialogs.width,
          data: {
            titleText: 'Email Verification Failed',
            bodyText: 'We failed to activate your account. Unverified accounts are removed after 24 hours without email verification.',
            closeButtonText: 'Ok'
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          this.navigateToRoot();
        });
      }
    );
  }

  private handleForgotPasswordVerification(token: string) {
    let dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
      width: environment.dialogs.width,
      data: { verificationToken: token }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.navigateToRoot();
    });
  }

  private handleChangeEmailVerification(token: string) {
    this.verificationService.verifyChangeEmail(token).subscribe(
      (response) => {
        this.loading = false;
        let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
          width: environment.dialogs.width,
          data: {
            titleText: 'Email Verified',
            bodyText: response ? 'Your email has been updated.' : 'Failed to verify your email change. Did the change request expire?',
            closeButtonText: 'Ok'
           }
        });

        dialogRef.afterClosed().subscribe(result => {
          this.navigateToRoot();
        });
      },
      (error) => {
        console.debug(error);
        this.loading = false;
        let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
          width: environment.dialogs.width,
          data: {
            titleText: 'Email Verification Failed',
            bodyText: 'Failed to verify your email change. Did the change request expire?',
            closeButtonText: 'Ok'
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          this.navigateToRoot();
        });
      }
    );
  }

  private navigateToRoot() {
    this.router.navigate(['/'], {});
  }
}
