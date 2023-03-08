import {Component} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';

import {AuthenticationService} from '../../../common/services/authentication.service';

@Component({
  selector: 'forgot-password-dialog',
  templateUrl: './forgot-password-dialog.component.html',
  styleUrls: ['./forgot-password-dialog.component.scss']
})
export class ForgotPasswordDialogComponent {
  public loading: boolean = false;

  public model: any = {};
  public resetAttempted: boolean = false;
  public resetSubmitted: boolean = false;
  public resetFailed: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ForgotPasswordDialogComponent>,
    private authenticationService: AuthenticationService
  ) { }

  public resetPassword() {
    this.loading = true;
    this.resetAttempted = true;
    this.authenticationService.forgotPassword(this.model.username).subscribe(
      (resetStatus) => {
        if (resetStatus) {
          this.resetSubmitted = true;
        } else {
          this.resetFailed = true;
        }
        this.loading = false;
      },
      (error) => {
        console.debug(error);
        this.resetFailed = true;
        this.loading = false;
      }
    );
  }
}
