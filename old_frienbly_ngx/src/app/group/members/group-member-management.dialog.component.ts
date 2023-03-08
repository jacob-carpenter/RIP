import {Component, Injectable, Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';

import {RemoveMemberRequest} from '../../common/contracts/group/models/requests/remove-member.request';
import {AddMemberRequest} from '../../common/contracts/group/models/requests/add-member.request';

import {UserDetails} from '../../common/contracts/user/models/user-details';
import {GroupMember} from '../../common/contracts/group/models/group-member';
import {GroupMemberType} from '../../common/contracts/group/models/group-member-type';

import {ScreenSizeService} from '../../common/services/screen-size.service';
import {GroupService} from '../../common/services/groups/group.service';
import {UserDetailsService} from '../../user/services/user-details.service';

import {ConfirmationDialogComponent} from '../../common/components/dialogs/confirmation/confirmation-dialog.component';

import {environment} from '../../../environments/environment';

@Component({
  selector: 'group-member-management-dialog',
  templateUrl: './group-member-management.dialog.component.html',
  styleUrls: ['./group-member-management.dialog.component.scss']
})
@Injectable()
export class GroupMemberManagementDialogComponent implements OnInit {
  public GroupMemberType = GroupMemberType;

  public loading: boolean;

  private currentUser: UserDetails;
  private groupMembers: GroupMember[];

  constructor(
    private dialog: MatDialog,
    private groupService: GroupService,
    private screenSizeService: ScreenSizeService,
    private userDetailsService: UserDetailsService
  ) {}

  public ngOnInit() {
    this.loading = true;

    this.userDetailsService.get().subscribe((user) => {
      this.currentUser = user;
      var groupId: number = this.groupService.getSelectedGroup().id;

      this.groupService.getMembers(groupId).subscribe((groupMembers) => {
        this.groupMembers = groupMembers;

        this.loading = false;
      });
    });
  }

  public promoteToAdmin(member: GroupMember) {
    if (this.screenSizeService.isMobile()) {
      this.promoteToAdminNoDialog(member);
    } else {
      let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: environment.dialogs.width,
        data: {
          titleText: 'Promote User?',
          bodyText: 'Are you sure you want to promote ' + member.user.username + ' to group admin?',
          confirmationButton: true,
          confirmationButtonText: 'Yes',
          closeButtonText: 'Cancel'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.promoteToAdminNoDialog(member);
        }
      });
    }
  }

  private promoteToAdminNoDialog(member: GroupMember) {
    var addMemberRequest = new AddMemberRequest();
    addMemberRequest.groupId = this.groupService.getSelectedGroup().id;
    addMemberRequest.userId = member.userId;
    addMemberRequest.groupMemberType = GroupMemberType.ADMIN;

    this.groupService.addMember(addMemberRequest).subscribe((response) => {
      for (var index = 0; index < this.groupMembers.length; index++) {
        if (this.groupMembers[index].userId == member.userId) {
          this.groupMembers[index].groupMemberType = GroupMemberType.ADMIN;
        }
      }
    });
  }

  public remove(member: GroupMember) {
    if (this.screenSizeService.isMobile()) {
      this.removeNoDialog(member);
    } else {
      let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: environment.dialogs.width,
        data: {
          titleText: 'Remove User?',
          bodyText: 'Are you sure you want to remove ' + member.user.username + ' from the group?',
          confirmationButton: true,
          confirmationButtonText: 'Yes',
          closeButtonText: 'Cancel'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.removeNoDialog(member);
        }
      });
    }
  }

  private removeNoDialog(member: GroupMember) {
    var removeMemberRequest = new RemoveMemberRequest();
    removeMemberRequest.groupId = this.groupService.getSelectedGroup().id;
    removeMemberRequest.userId = member.userId;

    this.groupService.removeMember(removeMemberRequest).subscribe((response) => {
      var foundIndex = -1;

      for (var index = 0; index < this.groupMembers.length; index++) {
        if (this.groupMembers[index].userId == member.userId) {
          foundIndex = index;
        }
      }

      if (foundIndex >= 0) {
        this.groupMembers.splice(foundIndex, 1);
      }
    });
  }
}
