import {Component, Inject, Input, Output, EventEmitter, OnInit, OnDestroy} from '@angular/core';
import {MatDialog} from '@angular/material';

import {Chat} from '../../../common/contracts/chat/chat';
import {ChatType} from '../../../common/contracts/chat/chat-type';
import {UserDetails} from '../../../common/contracts/user/models/user-details';
import {GroupDetails} from '../../../common/contracts/group/models/group-details';

import {GroupService} from '../../../common/services/groups/group.service';
import {UserDetailsService} from '../../../user/services/user-details.service';
import {GroupDetailsService} from '../../../group/services/group-details.service';

import {UserCardDetailsDialogComponent} from '../../../user/card/details/user-card.details.dialog';
import {GroupCardDetailsDialogComponent} from '../../../group/card/details/group-card.details.dialog';

import {environment} from '../../../../environments/environment';

@Component({
  selector: 'chat-header',
  templateUrl: './chat-header.component.html',
  styleUrls: ['./chat-header.component.scss']
})
export class ChatHeaderComponent implements OnInit {
  public loading: boolean = false;

  @Input()
  public chat: Chat;

  public currentChatUser: UserDetails;
  public currentChatGroup: GroupDetails;

  constructor(
    private dialog: MatDialog,
    private groupService: GroupService,
    private userDetailsService: UserDetailsService,
    private groupDetailsService: GroupDetailsService
  ) {}

  public ngOnInit() {
    this.loading = true;

    if (this.groupService.getSelectedGroup() != null) {
      this.populateCurrentChat(null, this.groupService.getSelectedGroup().id);
    } else {
      this.userDetailsService.get().subscribe((user) => {
        this.populateCurrentChat(user.id, null);
      });
    }
  }

  private populateCurrentChat(userId: number, groupId: number) {
    var chatUserId;
    var chatGroupId;
    for (var index = 0; index < this.chat.chatMembers.length; index++) {
      var chatMember = this.chat.chatMembers[index];

      if ((chatMember.groupId && chatMember.groupId != groupId) || this.chat.chatType == ChatType.GROUP) {
        chatGroupId = chatMember.groupId;
      } else if (chatMember.userId && chatMember.userId != userId) {
        chatUserId = chatMember.userId;
      }
    }

    if (chatGroupId) {
      this.groupDetailsService.get(chatGroupId).subscribe((group) => {
        this.currentChatGroup = group;
        this.loading = false;
      });
    } else if (chatUserId) {
      this.userDetailsService.getById(chatUserId).subscribe((user) => {
        this.currentChatUser = user;
        this.loading = false;
      });
    } else {
      this.loading = false;
    }
  }

  public openUserCard() {
    this.dialog.open(UserCardDetailsDialogComponent, {
      panelClass: 'details-card-dialog',
      data: {
        user: this.currentChatUser,
        disableGroupChat: true,
        hideOptions: true
      }
    });
  }

  public openGroupCard() {
    this.dialog.open(GroupCardDetailsDialogComponent, {
      panelClass: 'details-card-dialog',
      data: {
        group: this.currentChatGroup,
        hideOptions: true
      }
    });
  }
}
