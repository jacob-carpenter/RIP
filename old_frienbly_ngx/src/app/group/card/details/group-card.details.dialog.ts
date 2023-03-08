import {Component, Injectable, Inject, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

import { ChatDialogComponent } from '../../../messenger/dialogs/chat/chat.dialog';

import {Router} from '@angular/router';

import { GroupDetails } from '../../../common/contracts/group/models/group-details';
import { ViewableTag } from '../../../common/contracts/tags/tag';
import { TagType } from '../../../common/contracts/tags/tag.type';
import { AddMemberRequest } from '../../../common/contracts/group/models/requests/add-member.request';
import { UserDetails } from '../../../common/contracts/user/models/user-details';
import { GroupMemberType } from '../../../common/contracts/group/models/group-member-type';

import {ScreenSizeService} from '../../../common/services/screen-size.service';
import {GroupService} from '../../../common/services/groups/group.service';
import {UserDetailsService} from '../../../user/services/user-details.service';

import {ConfirmationDialogComponent} from '../../../common/components/dialogs/confirmation/confirmation-dialog.component';

import {environment} from '../../../../environments/environment';

@Component({
  selector: 'group-card-details-dialog',
  templateUrl: './group-card.details.dialog.html',
  styleUrls: ['./group-card.details.dialog.scss']
})
@Injectable()
export class GroupCardDetailsDialogComponent {
  public loading: boolean = true;

  public groupTags: ViewableTag[] = new Array<ViewableTag>();
  public lookingForIndividualTags: ViewableTag[] = new Array<ViewableTag>();
  public lookingForGroupTags: ViewableTag[] = new Array<ViewableTag>();

  public group: GroupDetails;
  public hideOptions: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<GroupCardDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private dialog: MatDialog,
    private groupService: GroupService,
    private userDetailsService: UserDetailsService,
    private screenSizeService: ScreenSizeService,
    private router: Router
  ) {
    this.group = data.group;
    this.hideOptions = data.hideOptions;
  }

  public ngOnInit() {
    this.groupTags = this.getViewableTagsOfType(TagType.INTERESTS);
    this.lookingForIndividualTags = this.getViewableTagsOfType(TagType.USER_SEARCH);
    this.lookingForGroupTags = this.getViewableTagsOfType(TagType.GROUP_SEARCH);

    this.loading = false;
  }

  public getViewableTagsOfType(tagType: TagType) : ViewableTag[] {
    var viewableTags = new Array<ViewableTag>();

    if (this.group.groupTags) {
      for (var index = 0; index < this.group.groupTags.length; index++) {
        var groupTag = this.group.groupTags[index];

        if (groupTag && groupTag.tagType == tagType) {
          var viewableTag = new ViewableTag(groupTag.tag.display, groupTag.tag.display);
          viewableTag.readonly = true;
          viewableTags.push(viewableTag);
        }
      }
    }

    return viewableTags;
  }

  public joinGroup() {
    var selectedGroup = this.groupService.getSelectedGroup();

    if (this.screenSizeService.isMobile()) {
      this.dialogRef.close();
    }

    setTimeout(() => {
      let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: environment.dialogs.width,
        data: {
          titleText: 'Join Group?',
          bodyText: !selectedGroup ? 'Are you sure you want to join this group?' : 'Are you sure you want to combine your group with this group? All members will transfer over, and the current group will be deleted.',
          confirmationButton: true,
          confirmationButtonText: 'Yes',
          closeButtonText: 'Cancel'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.group.joined = true;
          if (selectedGroup) {
            var addMemberRequest = new AddMemberRequest();
            addMemberRequest.memberGroupId = selectedGroup.id;
            addMemberRequest.groupId = this.group.id;

            this.groupService.addMember(addMemberRequest).subscribe(() => {
              location.reload();
            });
          } else {
            this.userDetailsService.get().subscribe((user: UserDetails) => {
              var addMemberRequest = new AddMemberRequest();
              addMemberRequest.groupMemberType = GroupMemberType.MEMBER;
              addMemberRequest.userId = user.id;
              addMemberRequest.groupId = this.group.id;

              this.groupService.addMember(addMemberRequest).subscribe(() => {
                this.dialogRef.close();
              });
            });
          }
        }
      });
    }, 0);
  }

  public openChat() {
    if (this.screenSizeService.isMobile()) {
      this.dialogRef.close();
    }

    setTimeout(() => {
      this.dialog.open(ChatDialogComponent, {
        panelClass: 'chat-dialog',
        data: {
          group: this.group
        }
      });
    }, 0);
  }
}
