import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent {

    constructor(
      public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any
     ) { }

}
