import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

import {ReportService} from '../../../services/report.service';

@Component({
  selector: 'report-dialog',
  templateUrl: './report-dialog.component.html',
  styleUrls: ['./report-dialog.component.scss']
})
export class ReportDialogComponent {
  public loading: boolean = false;

  public model: any = {};
  public reportAttempted: boolean = false;
  public reportSubmitted: boolean = false;
  public reportFailed: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ReportDialogComponent>,
    private reportService: ReportService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  public reportUser() {
    this.loading = true;
    this.reportAttempted = true;
    this.reportService.reportUser(this.data.targettedUserId, this.model.reason).subscribe(
      (reportStatus) => {
        this.reportSubmitted = true;
        this.loading = false;
      },
      (error) => {
        console.debug(error);
        this.reportFailed = true;
        this.loading = false;
      }
    );
  }
}
