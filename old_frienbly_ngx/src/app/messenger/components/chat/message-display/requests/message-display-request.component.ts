import {Component, Inject, Input, ElementRef, ViewChild, Pipe, PipeTransform, OnInit, OnDestroy} from '@angular/core';
import {MatDialog} from '@angular/material';

import {AddMemberRequest} from '../../../../../common/contracts/group/models/requests/add-member.request';
import {GroupMemberType} from '../../../../../common/contracts/group/models/group-member-type';
import {Request} from '../../../../../common/contracts/requests/request';
import {ChatType} from '../../../../../common/contracts/chat/chat-type';
import {Message} from '../../../../../common/contracts/chat/messages/message';

import {UserDetails} from '../../../../../common/contracts/user/models/user-details';
import {Group} from '../../../../../common/contracts/group/models/group';

import {ConfirmationDialogComponent} from '../../../../../common/components/dialogs/confirmation/confirmation-dialog.component';

import {ChatService} from '../../../../services/chat.service';
import {RequestService} from '../../../../services/request.service';
import {GroupService} from '../../../../../common/services/groups/group.service';
import {UserDetailsService} from '../../../../../user/services/user-details.service';

import {environment} from '../../../../../../environments/environment';

@Component({
  selector: 'message-display-request',
  templateUrl: './message-display-request.component.html',
  styleUrls: ['./message-display-request.component.scss']
})
export class MessageDisplayRequestComponent implements OnInit {
  public loading: boolean = false;
  public canAccept: boolean = false;

  @Input()
  public requestId: number;

  @Input()
  public message: Message;

  public request: Request;
  public user: UserDetails;
  public group: Group;

  constructor(
    private dialog: MatDialog,
    private chatService: ChatService,
    private requestService: RequestService,
    private groupService: GroupService,
    private userDetailsService: UserDetailsService
  ) {}

  public ngOnInit() {
    this.loading = true;
    this.group = this.groupService.getSelectedGroup();
    this.userDetailsService.get().subscribe((user) => {
      this.user = user;
      this.requestService.getRequestById(this.requestId).subscribe((request) => {
        this.request = request;

        this.canAccept = this.request.targetUserId == this.user.id || (this.group != null && this.request.targetGroupId == this.group.id);

        this.loading = false;
      });
    });
  }

  public acceptRequest() {
    var chat = this.chatService.getSelectedChat();

    var systemMessageText = '';
    var titleText = '';
    var bodyText = '';
    if (chat.chatType == ChatType.USER_EPHEMERAL) {
      titleText = 'Accept connection?';
      bodyText = 'Do you want to form a connection with this user?';
      systemMessageText = 'Connection formed!';
    } else if (this.group && this.request.groupId != null && this.request.targetGroupId != null) {
      titleText = 'Allow group to join?';
      bodyText = 'Do you want to allow the other group to combine with this group? The result will add all of their members to this group.';
      systemMessageText = 'Groups Combined!';
    } else if (this.group) {
      titleText = 'Allow user to join group?';
      bodyText = 'Do you want to allow the user to join this group?';
      systemMessageText = 'User joined!';
    } else {
      titleText = 'Join Group?';
      bodyText = 'Do you want to join the group?';
      systemMessageText = 'Group Joined!';
    }

    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: environment.dialogs.width,
      data: {
        titleText: titleText,
        bodyText: bodyText,
        confirmationButton: true,
        confirmationButtonText: 'Yes',
        closeButtonText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.request.accepted = true;

        if (this.request.groupId && this.request.targetGroupId) {
          chat.active = false;
          this.chatService.save(chat).subscribe(() => {
            var addMemberRequest = new AddMemberRequest();
            addMemberRequest.memberGroupId = this.request.groupId;
            addMemberRequest.groupId = this.request.targetGroupId;

            this.groupService.addMember(addMemberRequest).subscribe(() => {
              this.requestService.sendRequest(this.request);
            });
          });
        } else if (this.request.groupId || this.request.targetGroupId) {
          chat.active = false;
          this.chatService.save(chat).subscribe(() => {
            var addMemberRequest = new AddMemberRequest();
            addMemberRequest.groupMemberType = GroupMemberType.MEMBER;
            addMemberRequest.userId = this.request.targetUserId ? this.request.targetUserId : this.request.userId;
            addMemberRequest.groupId = this.request.groupId ? this.request.groupId : this.request.targetGroupId;

            this.groupService.addMember(addMemberRequest).subscribe(() => {
              this.requestService.sendRequest(this.request);
            });
          });

        } else {
          chat.chatType = ChatType.USER;
          this.chatService.save(chat).subscribe(() => {
            this.chatService.sendSystemMessage(this.request.requestId, systemMessageText, this.chatService.getSelectedChat());
            this.requestService.sendRequest(this.request);
          });
        }
      }
    });
  }

  public getAcceptText() : string {
    var chat = this.chatService.getSelectedChat();

    if (chat.chatType == ChatType.USER_EPHEMERAL) {
      return 'Connect With User';
    } else if (this.group && this.request.groupId != null && this.request.targetGroupId != null) {
      return 'Combine Group';
    } else if (this.group) {
      return 'Let User Join';
    } else {
      return 'Join Group';
    }
  }

}
