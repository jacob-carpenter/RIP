import {Injectable, Component, Input, Output, OnInit, EventEmitter} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material';

import {UserDetails} from '../../../common/contracts/user/models/user-details';
import {ConfirmationDialogComponent} from '../../../common/components/dialogs/confirmation/confirmation-dialog.component';
import {UserDetailsService} from '../../services/user-details.service';

import {AuthenticationService} from '../../../common/services/authentication.service';

import {environment} from '../../../../environments/environment';

@Component({
  selector: 'settings-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss']
})
@Injectable()
export class AccountSettingsComponent {

  loading: boolean = false;
  model: any = {};
  emailExists: boolean = false;
  passwordChangeFailed: boolean = false;

  @Input()
  userDetails: UserDetails;

  @Output()
  private validityStateChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private authenticationService: AuthenticationService,
    private userDetailsService: UserDetailsService,
    private dialog: MatDialog
  ) {}

  public changeEmailClicked() {
    this.loading = true;
    this.userDetailsService.changeEmail(this.model.email).subscribe(
      (changeStatus: boolean) => {
        this.loading = false;
        this.dialog.open(ConfirmationDialogComponent, {
          width: environment.dialogs.width,
          data: {
            titleText: changeStatus ? 'Email Verification' : 'Email Change Failed',
            bodyText: changeStatus ? 'A verification email has been sent. Please confirm your email by clicking the link in the verification email.' : 'Failed to issue email change request.',
            closeButtonText: 'Ok'
          }
        });
      },
      (error) => {
        this.loading = false;
        this.dialog.open(ConfirmationDialogComponent, {
          width: environment.dialogs.width,
          data: {
            titleText: 'Email Change Failed',
            bodyText: 'Failed to issue email change request. This email could already be in use.',
            closeButtonText: 'Ok'
          }
        });
      }
    );
  }

  public changePasswordClicked() {
    this.loading = true;
    this.userDetailsService.changePassword(this.model.currentPassword, this.model.newPassword).subscribe(
      (changeStatus: boolean) => {
        this.loading = false;
        this.dialog.open(ConfirmationDialogComponent, {
          width: environment.dialogs.width,
          data: {
            titleText: changeStatus ? 'Password Changed' : 'Password Change Failed',
            bodyText: changeStatus ? 'Your password has been changed.' : 'Failed to update password. Is your current password correct?',
            closeButtonText: 'Ok'
          }
        });
      },
      (error) => {
        this.loading = false;
        this.dialog.open(ConfirmationDialogComponent, {
          width: environment.dialogs.width,
          data: {
            titleText: 'Password Change Failed',
            bodyText: 'Failed to update password. Is your current password correct?',
            closeButtonText: 'Ok'
          }
        });
      }
    );
  }

  public deactivateAccountClicked() {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: environment.dialogs.width,
      data: {
        titleText: 'Deactivate Account?',
        bodyText:'Your account has been deactivated. \n\nAre you sure? We\'ll miss having you around.',
        closeButtonText: 'Cancel',
        confirmationButton: true,
        confirmationButtonText: 'Deactivate'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;

        this.userDetailsService.deactivateUser().subscribe(
          (response) => {
            let confirmationDialog = this.dialog.open(ConfirmationDialogComponent, {
              width: environment.dialogs.width,
              data: {
                titleText: 'Account Deactivated',
                bodyText:'We have deactivated your account. Please visit us again sometime!',
                closeButtonText: 'Ok'
              }
            });

            confirmationDialog.afterClosed().subscribe(result => {
              this.authenticationService.logout();
            });
          },
          (error) => {
            this.dialog.open(ConfirmationDialogComponent, {
              width: environment.dialogs.width,
              data: {
                titleText: 'Account Deactivation Failed',
                bodyText:'We\'re sorry but an error has occurred while deactivating your account. Please try again in a few minutes.',
                closeButtonText: 'Ok'
              }
            });
          }
        )
        // TODO Deactivate Account and then logout
      }
    });
  }
}
