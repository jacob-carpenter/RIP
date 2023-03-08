import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

import {VerificationService} from '../../../../common/services/verification/verification.service';

@Component({
  selector: 'change-password-dialog',
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.scss']
})
export class ChangePasswordDialogComponent {
  public loading: boolean = false;

  public model: any = {};
  public changeAttempted: boolean = false;
  public changeSubmitted: boolean = false;
  public changeFailed: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    private verificationService: VerificationService,
    @Inject(MAT_DIALOG_DATA) public data: any
   ) { }

   public changePassword() {
     this.loading = true;
     this.changeAttempted = true;
     this.verificationService.verifyForgotPassword(this.data.verificationToken, this.model.newPassword).subscribe(
       (changeStatus) => {
         if (changeStatus) {
           this.changeSubmitted = true;
         } else {
           this.changeFailed = true;
         }
         this.loading = false;
       },
       (error) => {
         console.debug(error);
         this.changeFailed = true;
         this.loading = false;
       }
     );
   }
}
