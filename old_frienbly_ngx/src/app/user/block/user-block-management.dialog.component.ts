import {Component, Injectable, Input, OnInit, OnDestroy} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';

import {ScreenSizeService} from '../../common/services/screen-size.service';
import { UserDetailsService } from '../../user/services/user-details.service';
import { BlockService } from '../../common/services/block.service';
import { ImageService } from '../../common/services/image.service';

import { UserDetails } from '../../common/contracts/user/models/user-details';

import {ConfirmationDialogComponent} from '../../common/components/dialogs/confirmation/confirmation-dialog.component';

import {environment} from '../../../environments/environment';

@Component({
  selector: 'user-block-management-dialog',
  templateUrl: './user-block-management.dialog.component.html',
  styleUrls: ['./user-block-management.dialog.component.scss']
})
@Injectable()
export class UserBlockManagementDialogComponent implements OnInit, OnDestroy {
  public loading: boolean;

  public users: UserDetails[];

  constructor(
    public dialogRef: MatDialogRef<UserBlockManagementDialogComponent>,
    private dialog: MatDialog,
    private blockService: BlockService,
    private userDetailsService: UserDetailsService,
    private screenSizeService: ScreenSizeService,
    private imageService: ImageService
  ) {}

  public ngOnInit() {
    this.blockService.addBlocksAlteredCallbacks(this.blocksAltered.bind(this));

    this.loading = true;
    this.blockService.getBlockedUserIds().subscribe((blockedUserIds) => {
      this.blocksAltered(blockedUserIds);
    });
  }

  public ngOnDestroy() {
    this.blockService.removeBlocksAlteredCallbacks(this.blocksAltered.bind(this));
  }

  public blocksAltered = (blockedUserIds: Array<number>) => {
    this.loading = true;
    if (blockedUserIds && blockedUserIds.length > 0) {
      this.userDetailsService.getMultiple(blockedUserIds).subscribe((users) => {
        this.users = users;

        var imageIds = [];
        for (var index = 0; index < users.length; index++) {
          if (users[index] && users[index].imageId) {
            imageIds.push(users[index].imageId);
          }
        }

        this.imageService.getMultiple(imageIds).subscribe(() => {
          this.loading = false;
        });
      });
    }
  }

  public unblockUser(user: UserDetails) {
    if (this.screenSizeService.isMobile()) {
      this.unblockUserNoDialog(user);
    } else {

      let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: environment.dialogs.width,
        data: {
          titleText: 'Unblock User?',
          bodyText: 'Are you sure you want to unblock messages from ' + user.username + '?',
          confirmationButton: true,
          confirmationButtonText: 'Yes',
          closeButtonText: 'Cancel'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.unblockUserNoDialog(user);
        }
      });
    }
  }

  private unblockUserNoDialog(user: UserDetails) {
    this.blockService.unblockUser(user.id).subscribe(() => {
      this.users.splice(this.users.indexOf(user), 1);

      if (this.users.length == 0) {
        this.dialogRef.close();
      }
    });
  }
}
