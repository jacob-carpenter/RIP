import {Injectable, Component, HostListener, Input, Pipe, PipeTransform, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';

import {UserDetails} from '../../../../../common/contracts/user/models/user-details';
import {GroupDetails} from '../../../../../common/contracts/group/models/group-details';
import {GroupMember} from '../../../../../common/contracts/group/models/group-member';

import {Chat} from '../../../../../common/contracts/chat/chat';
import {ChatType} from '../../../../../common/contracts/chat/chat-type';
import {GroupMemberType} from '../../../../../common/contracts/group/models/group-member-type';

import {GroupDetailsService} from '../../../../../group/services/group-details.service';
import {UserDetailsService} from '../../../../../user/services/user-details.service';
import {GroupService} from '../../../../../common/services/groups/group.service';

import {ChatService} from '../../../../services/chat.service';
import {EventService} from '../../../../../common/services/event.service';

import {ConfirmationDialogComponent} from '../../../../../common/components/dialogs/confirmation/confirmation-dialog.component';

import {environment} from '../../../../../../environments/environment';

@Component({
  selector: 'chat-menu-display',
  templateUrl: './chat-menu-display.component.html',
  styleUrls: ['./chat-menu-display.component.scss']
})
export class ChatMenuDisplayComponent implements OnInit{
  public user: UserDetails;
  public group: GroupDetails;
  public display: string;

  private myGroupIds: number[] = [];

  public ChatType = ChatType;

  @Input()
  public chat: Chat;

  @Input()
  public users: any;

  @Input()
  public groups: any;

  @Input()
  public mainUserId: any;

  @Input()
  public mainGroupId: any;

  @Input()
  public hideGroup: boolean = false;

  @Input()
  public hideUser: boolean = false;

  @Input()
  public canCloseChat: boolean = false;

  @Input()
  public hideLeftPadding: boolean = false;

  public constructor(
    private dialog: MatDialog,
    private userDetailsService: UserDetailsService,
    private groupService: GroupService,
    private groupDetailsService: GroupDetailsService,
    private chatService: ChatService,
    private eventService: EventService
  ) {}

  public ngOnInit() {
    this.groupService.getGroupsByMemberType(GroupMemberType.MEMBER).subscribe((response: GroupMember[]) => {
      for (var index = 0; index < response.length; index++) {
        this.myGroupIds.push(response[index].group.id);
      }
      this.groupService.getGroupsByMemberType(GroupMemberType.ADMIN).subscribe((response: GroupMember[]) => {
        for (var index = 0; index < response.length; index++) {
          this.myGroupIds.push(response[index].group.id);
        }
        this.userDetailsService.get().subscribe((myUser: UserDetails) => {
          switch (this.chat.chatType) {
            case ChatType.USER:
              for (var index = 0; index < this.chat.chatMembers.length; index++) {
                var chatMember = this.chat.chatMembers[index];

                if (chatMember.userId && chatMember.userId != myUser.id) {
                  var user = this.users[chatMember.userId];
                  this.setUserDisplay(user);
                  this.user = user;
                }
              }
              break;
            case ChatType.USER_EPHEMERAL:
              for (var index = 0; index < this.chat.chatMembers.length; index++) {
                var chatMember = this.chat.chatMembers[index];

                if (chatMember.userId && chatMember.userId != myUser.id) {
                  var user = this.users[chatMember.userId];
                  this.setUserDisplay(user);
                  this.user = user;
                }
              }
              break;
            case ChatType.GROUP:
              for (var index = 0; index < this.chat.chatMembers.length; index++) {
                var chatMember = this.chat.chatMembers[index];

                if (chatMember.groupId) {
                  var group = this.groups[chatMember.groupId];
                  this.setGroupDisplay(group);
                  this.group = group;
                }
              }
              break;
            case ChatType.GROUP_EPHEMERAL:
              for (var index = 0; index < this.chat.chatMembers.length; index++) {
                var chatMember = this.chat.chatMembers[index];

                if (chatMember.groupId) {
                  if (this.mainGroupId) {
                    if (this.mainGroupId == chatMember.groupId) {
                      var group = this.groups[chatMember.groupId];
                      this.setGroupDisplay(group);
                      this.group = group;
                    }
                  } else if (this.myGroupIds.indexOf(chatMember.groupId) < 0) {
                    var group = this.groups[chatMember.groupId];
                    this.setGroupDisplay(group);
                    this.group = group;
                  }
                } else if (chatMember.userId) {
                  if (this.mainUserId) {
                    if (this.mainUserId == chatMember.userId) {
                      var user = this.users[chatMember.userId];
                      this.setUserDisplay(user);
                      this.user = user;
                    }
                  } else {
                    var user = this.users[chatMember.userId];
                    this.setUserDisplay(user);
                    this.user = user;
                  }
                }
              }
              break;
          }
        });
      });
    });
  }

  public setGroupDisplay(group: GroupDetails) {
    if (!this.hideGroup) {
      this.display = group ? group.name : 'UKNOWN GROUP';
    }
  }

  public setUserDisplay(user: UserDetails) {
    if (!this.hideUser) {
      this.display = user ? user.username : 'UKNOWN USER';
    }
  }

  public closeChat(event: any) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: environment.dialogs.width,
      data: {
        titleText: 'Close Chat?',
        bodyText: 'This will deactivate the chat for both users. Are you sure you want to close the chat?',
        confirmationButton: true,
        confirmationButtonText: 'Yes',
        closeButtonText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.chat.active = false;
        //this.chatService.sendSystemMessage('This chat has been deactivated.', this.chatService.getSelectedChat());
        this.chatService.save(this.chat).subscribe(() => {
          this.eventService.refreshChatCache();
        });
      }
    });
  }
}
