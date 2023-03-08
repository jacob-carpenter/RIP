import {Component, Inject, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener} from '@angular/core';
import {MatDialog} from '@angular/material';

import {AddMemberRequest} from '../../../common/contracts/group/models/requests/add-member.request';
import {GroupMemberType} from '../../../common/contracts/group/models/group-member-type';

import {Message} from '../../../common/contracts/chat/messages/message';
import {UserDetails} from '../../../common/contracts/user/models/user-details';
import {Group} from '../../../common/contracts/group/models/group';
import {Request} from '../../../common/contracts/requests/request';
import {RequestType} from '../../../common/contracts/requests/request.type';

import {Chat} from '../../../common/contracts/chat/chat';
import {ChatType} from '../../../common/contracts/chat/chat-type';

import {EventSettingsService} from '../../../common/services/events/event-settings.service';
import {ChatService} from '../../services/chat.service';
import {RequestService} from '../../services/request.service';
import {EmojiService} from '../../services/emojis/emoji.service';
import {GroupService} from '../../../common/services/groups/group.service';
import {UserDetailsService} from '../../../user/services/user-details.service';
import {GiphyService} from '../../services/giphy/giphy.service';
import {ScreenSizeService} from '../../../common/services/screen-size.service'

import {ConfirmationDialogComponent} from '../../../common/components/dialogs/confirmation/confirmation-dialog.component';
import {EventSettingsDialogComponent} from '../../../events/components/settings-dialog/event-settings-dialog.component';

import {environment} from '../../../../environments/environment';

@Component({
  selector: 'chat-message-input',
  templateUrl: './chat-message-input.component.html',
  styleUrls: ['./chat-message-input.component.scss']
})
export class ChatMessageInputComponent implements OnInit, OnDestroy {
  public ChatType = ChatType;

  public loading: boolean = false;
  public hideRequestButton: boolean = false;
  public isMobile: boolean = false;

  public currentUser: UserDetails;
  public currentGroup: Group;

  public request: Request;

  @Input()
  public disableMessageInputButtons: boolean = false;
  @Input()
  public disableGroupChat: boolean = false;
  @Input()
  public targetUserId: number;
  @Input()
  public targetGroupId: number;

  public _chat: Chat;
  @Input()
  set chat(chat: Chat) {
    this.loading = true;
    this.request = null;

    this._chat = chat;
    this.chatType = chat ? chat.chatType : null;
    this.currentGroup = !this.disableGroupChat ? this.groupService.getSelectedGroup() : null;
    this.userDetailsService.get().subscribe((userDetails) => {
      this.currentUser = userDetails;

      if (this.chatType && (this.chatType == ChatType.GROUP_EPHEMERAL || this.chatType == ChatType.USER_EPHEMERAL)) {
        if (this.currentGroup) {
          // If user exists in both groups, hide the request button to mitigate the complexity of combining groups as an admin of both.
          if (this.targetGroupId) {
            this.hideRequestButton = true;
            this.groupService.getMembers(this.targetGroupId).subscribe((groupMembers) => {
              var foundUserAsAdmin = false;
              for (var index = 0; index < groupMembers.length; index++) {
                var groupMember = groupMembers[index];

                if (groupMember.user && groupMember.userId == this.currentUser.id && groupMember.groupMemberType == GroupMemberType.ADMIN) {
                  foundUserAsAdmin = true;
                }
              }

              this.hideRequestButton = foundUserAsAdmin;
            });
          }

          // Process the current group's requests
          this.requestService.getGroupRequests(this.currentGroup.id).subscribe((requests) => {
            for (var index = 0; index < requests.length; index++) {
              this.requestReceived(requests[index]);
            }

            this.loading = false;
          });
        } else {
          // Process the current user's requests
          this.requestService.getUserRequests(this.currentUser.id).subscribe((requests) => {
            for (var index = 0; index < requests.length; index++) {
              this.requestReceived(requests[index]);
            }

            this.loading = false;
          });
        }
      } else {
        this.loading = false;
      }
    });
  }

  public chatType: ChatType;

  public openEmoticonPopupFunction: Function;

  public message: string = '';
  public canSend: boolean = true;

  @Output()
  public send: EventEmitter<Message> = new EventEmitter();


  public constructor(
    private dialog: MatDialog,
    private emojiService: EmojiService,
    private requestService: RequestService,
    private groupService: GroupService,
    private userDetailsService: UserDetailsService,
    private chatService: ChatService,
    private eventService: EventSettingsService,
    private giphyService: GiphyService,
    private screenSizeService: ScreenSizeService
  ) {}

  public ngOnInit() {
    this.requestService.addRequestReceivedCallback(this.requestReceived.bind(this));

    this.calculateMobileState();
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.calculateMobileState();
  }

  public ngOnDestroy() {
    this.requestService.removeRequestReceivedCallback(this.requestReceived.bind(this));
  }

  public calculateMobileState() {
    this.isMobile = this.screenSizeService.isMobile();
  }

  public requestReceived = (request: Request) => {
    if (request.accepted) {
      if (this.request && request.requestId == this.request.requestId) {
        this.request.accepted = true;
      }

      return;
    }

    if (!this.chatType || (this.chatType != ChatType.GROUP_EPHEMERAL && this.chatType != ChatType.USER_EPHEMERAL)) {
      return;
    }

    if (this.chatType == ChatType.USER_EPHEMERAL) {
      if (this.currentUser &&
        (request.userId == this.currentUser.id || request.targetUserId == this.currentUser.id) &&
        (request.userId == this.targetUserId || request.targetUserId == this.targetUserId) &&
        !request.groupId && !request.targetGroupId
      ) {
        this.request = request;
      }
    } else if (this.chatType == ChatType.GROUP_EPHEMERAL) {
      if (this.currentGroup && (request.groupId == this.currentGroup.id || request.targetGroupId == this.currentGroup.id)) {
        if (this.targetGroupId && (request.groupId == this.targetGroupId || request.targetGroupId == this.targetGroupId)) {
          this.request = request;
        } else if (this.targetUserId && (request.userId == this.targetUserId || request.targetUserId == this.targetUserId)) {
          this.request = request;
        }
      } else if (this.currentUser && (request.userId == this.currentUser.id || request.targetUserId == this.currentUser.id)) {
        if (this.targetGroupId && (request.groupId == this.targetGroupId || request.targetGroupId == this.targetGroupId)) {
          this.request = request;
        }
      }
    }
  }

  public setOpenEmoticonPopupEvent(openEmoticonPopupFunction: Function) {
    this.openEmoticonPopupFunction = openEmoticonPopupFunction;
  }

  public insertEmoji(emoji: string) {
    this.message = this.message + emoji;
  }

  public messageConfirmed(event: any) {
    event.preventDefault();

    this.sendMessage();

    return true;
  }

  public sendMessage() {
    this.message = this.message.replace(/\r?\n|\r/g, '');
    this.message = this.message.trim();

    if (this.message.length > 0 && this.canSend) {
      this.canSend = false;
      setTimeout(() => {
        this.canSend = true;
      }, 100);

      if (this.giphyService.isGiphyTextEntry(this.message)) {
        var messageContainer = new Message();
        messageContainer.message = this.message;

        var giphySearch = this.giphyService.getGiphySearchString(this.message);
        if (giphySearch) {
          this.giphyService.getGiphyLink(giphySearch).subscribe((image) => {

            messageContainer.giphyUrl = image.url;
            messageContainer.imageHeight = image.height;
            this.send.emit(messageContainer);
          });

          this.message = '';
          return;
        }
      }

      var messageContainer = new Message();
      messageContainer.message = this.emojiService.translateMessageEmoticonsToSymbols(this.message);

      this.message = '';
      this.send.emit(messageContainer);
    }
  }

  public sendConnectionRequest() {
    this.currentGroup = this.groupService.getSelectedGroup();
    var systemMessageText = '';
    var titleText = '';
    var bodyText = '';
    if (this.chatType == ChatType.USER_EPHEMERAL) {
      titleText = 'Ask to form connection?';
      bodyText = 'Do you want to ask to form a connection with this user?';
      systemMessageText = this.currentUser.username + ' wants to form a connection';
    } else if (this.currentGroup && this.targetGroupId) {
      titleText = 'Ask to join group?';
      bodyText = 'Do you want to ask to combine your group with this group? The result will add all of your members to the result group.';
      systemMessageText = this.currentUser.username + ' wants to combine groups';
    } else if (this.currentGroup) {
      titleText = 'Ask to join group?';
      bodyText = 'Do you want to ask the user to join your group?';
      systemMessageText = this.currentUser.username + ' sent a group invite';
    } else {
      titleText = 'Ask to join group?';
      bodyText = 'Do you want to ask to join the group?';
      systemMessageText = this.currentUser.username + ' wants to join the group';
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
        var request = new Request();
        if (this.chatType && this.chatType == ChatType.USER_EPHEMERAL) {
          request.userId = this.currentUser.id;
          request.targetUserId = this.targetUserId;
          request.requestType = RequestType.FORM_CONNECTION;

        } else {
          request.userId = this.currentUser.id;
          request.groupId = this.currentGroup ? this.currentGroup.id : null;
          request.targetUserId = this.targetUserId;
          request.targetGroupId = this.targetGroupId;
          request.requestType = RequestType.JOIN_GROUP;
        }

        this.requestService.saveRequest(request).subscribe((requestResponse) => {
          this.requestService.sendRequest(requestResponse);

          this.chatService.sendSystemMessage(requestResponse.requestId, systemMessageText, this.chatService.getSelectedChat());
        });
      }
    });
  }

  public acceptConnectionRequest() {
    this.currentGroup = this.groupService.getSelectedGroup();

    var systemMessageText = '';
    var titleText = '';
    var bodyText = '';
    if (this.chatType == ChatType.USER_EPHEMERAL) {
      titleText = 'Accept connection?';
      bodyText = 'Do you want to form a connection with this user?';
      systemMessageText = 'Connection formed!';
    } else if (this.currentGroup && this.targetGroupId) {
      titleText = 'Allow group to join?';
      bodyText = 'Do you want to allow the other group to combine with this group? The result will add all of their members to this group.';
      systemMessageText = 'Groups Combined!';
    } else if (this.currentGroup) {
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

        var chat = this.chatService.getSelectedChat();
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

  public removeConnection() {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: environment.dialogs.width,
      data: {
        titleText: 'Remove Connection?',
        bodyText: 'Are you sure you want to remove this connection?',
        confirmationButton: true,
        confirmationButtonText: 'Yes',
        closeButtonText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        var request = new Request();
        request.userId = this.currentUser.id;
        request.targetUserId = this.getTargetUserId(this.chatService.getSelectedChat());
        request.accepted = true;
        request.requestType = RequestType.DISSOLVE_CONNECTION;
        this.requestService.sendRequest(request);

        var chat = this.chatService.getSelectedChat();
        chat.chatType = ChatType.USER_EPHEMERAL;
        this.chatService.save(chat).subscribe(() => {});
        this.chatService.sendSystemMessage(request.requestId, 'This connection has been removed.', this.chatService.getSelectedChat());
      }
    });
  }

  public planEvent() {
    this.eventService.setSelectedEvent(null);
    this.dialog.open(EventSettingsDialogComponent, {
      width: environment.dialogs.width,
      panelClass: 'event-settings-dialog',
      data: {
        user: this.currentUser,
        chat: this._chat
      }
    });
  }

  private getTargetUserId(chat: Chat) {
    for (var chatMemberIndex = 0; chatMemberIndex < chat.chatMembers.length; chatMemberIndex++) {
      var chatMember = chat.chatMembers[chatMemberIndex];

      if (chatMember.userId && chatMember.userId != this.currentUser.id) {
        return chatMember.userId;
      }
    }
    return null;
  }
}
