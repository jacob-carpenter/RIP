import {Component, Injectable, Inject, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

import { SexType } from '../../../common/contracts/user/models/sex.type';
import { UserDetails } from '../../../common/contracts/user/models/user-details';

import { ViewableTag } from '../../../common/contracts/tags/tag';
import { TagType } from '../../../common/contracts/tags/tag.type';

import { ReportDialogComponent } from './dialogs/report-dialog.component';
import { ChatDialogComponent } from '../../../messenger/dialogs/chat/chat.dialog';
import {ConfirmationDialogComponent} from '../../../common/components/dialogs/confirmation/confirmation-dialog.component';

import {environment} from '../../../../environments/environment';

import {ScreenSizeService} from '../../../common/services/screen-size.service';
import {BlockService} from '../../../common/services/block.service';
import {UserDetailsService} from '../../services/user-details.service';

@Component({
  selector: 'user-card-details-dialog',
  templateUrl: './user-card.details.dialog.html',
  styleUrls: ['./user-card.details.dialog.scss']
})
@Injectable()
export class UserCardDetailsDialogComponent implements OnInit {
  public loading: boolean = true;

  public SexType = SexType;

  public age: number;
  public personalTags: ViewableTag[] = new Array<ViewableTag>();
  public interestTags: ViewableTag[] = new Array<ViewableTag>();
  public lookingForIndividualTags: ViewableTag[] = new Array<ViewableTag>();
  public lookingForGroupTags: ViewableTag[] = new Array<ViewableTag>();

  public currentUser: UserDetails;
  public user: UserDetails;
  public isBlocked: boolean = false;
  public disableGroupChat: boolean = false;
  public hideOptions: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<UserCardDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private dialog: MatDialog,
    private blockService: BlockService,
    private screenSizeService: ScreenSizeService,
    private userDetailsService: UserDetailsService
  ) {
    this.user = data.user;
    this.disableGroupChat = data.disableGroupChat;
    this.hideOptions = data.hideOptions ? data.hideOptions : false;
  }

  public ngOnInit() {
    this.age = this.getAge(new Date(this.user.birthdate));

    this.personalTags = this.getViewableTagsOfType(TagType.PERSONAL);
    this.interestTags = this.getViewableTagsOfType(TagType.INTERESTS);
    this.lookingForIndividualTags = this.getViewableTagsOfType(TagType.USER_SEARCH);
    this.lookingForGroupTags = this.getViewableTagsOfType(TagType.GROUP_SEARCH);

    this.userDetailsService.get().subscribe((response) => {
      this.currentUser = response;

      this.blockService.getBlockedUserIds().subscribe((blockedUserIds) => {
        this.isBlocked = blockedUserIds.indexOf(this.user.id) >= 0;

        this.loading = false;
      });
    });
  }

  public getViewableTagsOfType(tagType: TagType) : ViewableTag[] {
    var viewableTags = new Array<ViewableTag>();

    for (var index = 0; index < this.user.userTags.length; index++) {
      var userTag = this.user.userTags[index];

      if (userTag && userTag.tagType == tagType) {
        var viewableTag = new ViewableTag(userTag.tag.display, userTag.tag.display);
        viewableTag.readonly = true;
        viewableTags.push(viewableTag);
      }
    }

    return viewableTags;
  }

  private getAge(birthday: Date) {
    var ageDifMs = Date.now() - birthday.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  public openChat() {
    if (this.screenSizeService.isMobile()) {
      this.dialogRef.close();
    }

    setTimeout(() => {
      this.dialog.open(ChatDialogComponent, {
        panelClass: 'chat-dialog',
        data: {
          user: this.user,
          disableGroupChat: this.disableGroupChat
        }
      });
    }, 0);
  }

  public openReport() {
    if (this.screenSizeService.isMobile()) {
      this.dialogRef.close();
    }

    setTimeout(() => {
      let dialogRef = this.dialog.open(ReportDialogComponent, {
        data: {
          targettedUserId: this.user.id
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.dialogRef.close();
        }
      });
    }, 0);
  }

  public openBlock() {
    if (this.screenSizeService.isMobile()) {
      this.dialogRef.close();
    }

    setTimeout(() => {
      let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: environment.dialogs.width,
        data: {
          titleText: 'Block User?',
          bodyText: 'Are you sure you want to block messages from this user?',
          confirmationButton: true,
          confirmationButtonText: 'Yes',
          closeButtonText: 'Cancel'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.blockService.blockUser(this.user.id).subscribe(() => {
            this.isBlocked = true;
            this.dialogRef.close();
          });
        }
      });
    }, 0);
  }

  public unblock() {
    if (this.screenSizeService.isMobile()) {
      this.dialogRef.close();
    }

    setTimeout(() => {
      let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: environment.dialogs.width,
        data: {
          titleText: 'Unblock User?',
          bodyText: 'Are you sure you want to unblock messages from this user?',
          confirmationButton: true,
          confirmationButtonText: 'Yes',
          closeButtonText: 'Cancel'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.blockService.unblockUser(this.user.id).subscribe(() => {
            this.isBlocked = false;
          });
        }
      });
    }, 0);
  }

}
