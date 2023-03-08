import {Injectable, Component, HostListener, Input, OnInit, OnDestroy} from '@angular/core';
import {MatDialog} from '@angular/material';

import {Observable} from 'rxjs/Observable';
import {AsyncSubject} from 'rxjs/AsyncSubject';

import {UserDetails} from '../../../../common/contracts/user/models/user-details';
import {GroupDetails} from '../../../../common/contracts/group/models/group-details';

import {Chat} from '../../../../common/contracts/chat/chat';
import {ChatType} from '../../../../common/contracts/chat/chat-type';

import {ImageItem} from '../../../../common/contracts/image/image.item';
import {GroupMemberType} from '../../../../common/contracts/group/models/group-member-type';
import {GroupMember} from '../../../../common/contracts/group/models/group-member';

import {ChatService} from '../../../services/chat.service';
import {ChatUserService} from '../../../services/chat-user.service';
import {ImageService} from '../../../../common/services/image.service';
import {UserDetailsService} from '../../../../user/services/user-details.service';
import {GroupService} from '../../../../common/services/groups/group.service';
import {GroupDetailsService} from '../../../../group/services/group-details.service';
import {UnreadMessageService} from '../../../../common/services/unread-message.service';

import { UserCardDetailsDialogComponent } from '../../../../user/card/details/user-card.details.dialog';

@Component({
  selector: 'messenger-left-menu',
  templateUrl: './messenger.left-menu.component.html',
  styleUrls: ['./messenger.left-menu.component.scss']
})
export class MessengerLeftMenuComponent implements OnInit, OnDestroy {
  public ChatType = ChatType;

  public loading: boolean = false;

  public chatMembers: UserDetails[];

  public myUserId: number;
  public myGroupIds: number[] = [];

  public users: any = {};
  public groups: any = {};

  public potentialGroupChatIdToGroupMemberChats: any = {};
  public potentialGroupChats: any = [];

  public activeChats: Chat[];
  @Input()
  set chats(inputChats: Chat[]) {
    this.activeChats = inputChats;

    this.initializeMenu();
  }
  @Input()
  public isLeftMenuExpanded: boolean;
  @Input()
  public isMobile: boolean;

  public activeChatUserIds: number[] = [];
  public unreadChatIds: number[] = [];

  public constructor(
    private chatService: ChatService,
    private chatUserService: ChatUserService,
    private userDetailsService: UserDetailsService,
    private groupDetailsService: GroupDetailsService,
    private groupService: GroupService,
    private imageService: ImageService,
    private unreadMessageService: UnreadMessageService,
    private dialog: MatDialog
  ) {}

  public ngOnInit() {
    this.activeChatUserIds = this.chatUserService.loggedInUsers;

    this.unreadMessageService.addUnreadChatIdsChangedCallback(this.unreadChatsUpdated.bind(this));
    this.chatUserService.addActiveChatUsersChangedCallback(this.activeChatUsersChanged.bind(this));

    this.chatService.addNewChatCallbacks(this.addChat.bind(this));
    this.chatService.addSelectedChatCallback(this.chatSelected.bind(this));

    this.initializeMenu();
  }

  private initializeMenu() {
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.unreadMessageService.getUnviewedChatIdsFromApi().subscribe((response) => {
      this.unreadChatIds = response;

      this.groupService.getGroupsByMemberType(GroupMemberType.MEMBER).subscribe((response: GroupMember[]) => {
        for (var index = 0; index < response.length; index++) {
          this.myGroupIds.push(response[index].group.id);
        }
        this.groupService.getGroupsByMemberType(GroupMemberType.ADMIN).subscribe((response: GroupMember[]) => {
          for (var index = 0; index < response.length; index++) {
            this.myGroupIds.push(response[index].group.id);
          }

          this.groupDetailsService.getMultiple(this.myGroupIds).subscribe((response) => {
            this.userDetailsService.get().subscribe((response: UserDetails) => {
              this.myUserId = response.id;

              this.populateChatMetadata(this.activeChats).subscribe(() => {
                this.populatePotentialGroupMemberChats();
                this.populatePotentialGroupsToJoinChats();

                this.defaultSelectedChat();
              });
            });
          });
        });
      });
    });
  }

  public defaultSelectedChat() {
    if (this.activeChats && this.activeChats.length > 0) {
      var selectedChat: Chat;

      for (var index = 0; index < this.activeChats.length; index++) {
        var foundChat = this.activeChats[index];

        if (!selectedChat || selectedChat.lastActivity < foundChat.lastActivity) {
          selectedChat = foundChat;
        }
      }

      if (selectedChat.chatType == ChatType.GROUP) {
        this.selectChat(selectedChat, null, null, selectedChat);
      } else if (selectedChat.chatType == ChatType.USER) {
        this.selectChat(selectedChat, this.getTargetUserId(selectedChat), null, null);
      } else if (selectedChat.chatType == ChatType.GROUP_EPHEMERAL) {
        this.selectChat(selectedChat, selectedChat.sideGroupId ? null : this.getTargetUserId(selectedChat), selectedChat.sideGroupId, this.getParentChat(selectedChat));
      } else if (selectedChat.chatType == ChatType.USER_EPHEMERAL) {
        this.selectChat(selectedChat, selectedChat.sideGroupId ? null : this.getTargetUserId(selectedChat), selectedChat.sideGroupId, null);
      }
    }
  }

  private getParentChat(selectedChat: Chat) : Chat {
    for (var index = 0; index < this.activeChats.length; index++) {
      var foundChildChats = this.potentialGroupChatIdToGroupMemberChats[this.activeChats[index].chatId];
      if (foundChildChats) {
        for (var childChatIndex = 0; childChatIndex < foundChildChats.length; childChatIndex++) {
          var childChat = foundChildChats[childChatIndex];

          if (childChat.chatId == selectedChat.chatId) {
            return this.activeChats[index];
          }
        }
      }
    }

    return null;
  }

  public ngOnDestroy() {
    this.unreadMessageService.removeUnreadChatIdsChangedCallback(this.unreadChatsUpdated.bind(this));
    this.chatUserService.removeActiveChatUsersChangedCallback(this.activeChatUsersChanged.bind(this));
    this.chatService.removeNewChatCallbacks(this.addChat.bind(this));
    this.chatService.removeSelectedChatCallback(this.chatSelected.bind(this));
  }

  public unreadChatsUpdated = (unreadChatIds: number[]) => {
    this.unreadChatIds = unreadChatIds;
  }

  public activeChatUsersChanged = (activeChatUserIds: number[]) => {
    this.activeChatUserIds = activeChatUserIds;
  }

  public chatSelected = (chat: Chat, targetUserId: number, targetGroupId: number, groupChat: Chat) => {
    this.selectChat(chat, targetUserId, targetGroupId, groupChat, false);
  }

  public selectChat(chat: Chat, targetUserId: number, targetGroupId: number, groupChat: Chat, notify: boolean = true) {
    if (this.chatService.getSelectedChat() == chat) {
      return;
    }

    this.loading = true;
    this.chatMembers = [];
    this.chatService.getMembers(chat).subscribe((response: UserDetails[]) => {
      this.chatMembers = response;

      this.setSelectedGroup(groupChat);
      if (notify) {
        this.chatService.setSelectedChat(chat, targetUserId, targetGroupId, groupChat);
      }
      this.loading = false;
    });
  }

  private setSelectedGroup(chat: Chat) {
    if (chat && chat.chatType == ChatType.GROUP) {
      this.groupService.get(chat.chatMembers[0].groupId).subscribe((group) => {
        this.groupService.setSelectedGroup(group);
      });
    } else {
      this.groupService.setSelectedGroup(null);
    }
  }

  public addChat = (chat: Chat) => {
    var found = false;
    for (var index = 0; index < this.activeChats.length; index++) {
      if (this.activeChats[index].chatId == chat.chatId) {
        found = true;
      }
    }

    if (!found) {
      this.activeChats.push(chat);
    }

    this.loading = true;
    setTimeout(() => {
      this.populateChatMetadata([chat]).subscribe(() => {
        this.populatePotentialGroupMemberChats();
        this.populatePotentialGroupsToJoinChats();
      });
    }, 0);
  }

  private populateChatMetadata(chats: Chat[]) : Observable<any> {
    var requestSubject = new AsyncSubject<any>();

    var userIds: Array<number> = [];
    var groupIds: Array<number> = [];
    var imageIds: Array<number> = [];

    for (var index = 0; index < chats.length; index++) {
      var chat = chats[index];

      if (!chat.chatMembers) {
        continue;
      }

      for (var memberIndex = 0; memberIndex < chat.chatMembers.length; memberIndex++) {
        var member = chat.chatMembers[memberIndex];

        if (member.userId && userIds.indexOf(member.userId) < 0) {
          userIds.push(member.userId);
        } else if (member.groupId && groupIds.indexOf(member.groupId) < 0) {
          groupIds.push(member.groupId);
        }
      }
    }
    if (userIds.length > 0) {
      this.userDetailsService.getMultiple(userIds).subscribe((userResponse: UserDetails[]) => {
        var imageIds = [];

        for (var index = 0; index < userResponse.length; index++) {
          var user = userResponse[index];

          this.users[user.id] = user;

          if (user.imageId && imageIds.indexOf(user.imageId) < 0) {
            imageIds.push(user.imageId);
          }
        }

        if (groupIds.length > 0) {
          this.groupDetailsService.getMultiple(groupIds).subscribe((groupResponse: GroupDetails[]) => {

            for (var index = 0; index < groupResponse.length; index++) {
              var group = groupResponse[index];
              this.groups[group.id] = group;

              if (group.imageId && imageIds.indexOf(group.imageId) < 0) {
                imageIds.push(group.imageId);
              }
            }

            if (imageIds.length > 0) {
              this.imageService.getMultiple(imageIds).subscribe((images: ImageItem[]) => {
                this.loading = false;
                requestSubject.next({});
                requestSubject.complete();
              });
            } else {
              this.loading = false;
              requestSubject.next({});
              requestSubject.complete();
            }
          });
        } else {
          this.loading = false;
          requestSubject.next({});
          requestSubject.complete();
        }
      });
    } else if (groupIds.length > 0) {
      this.groupDetailsService.getMultiple(groupIds).subscribe((response: GroupDetails[]) => {
        var imageIds = [];

        for (var index = 0; index < response.length; index++) {
          var group = response[index];
          this.groups[group.id] = group;

          if (group.imageId && imageIds.indexOf(group.imageId) < 0) {
            imageIds.push(group.imageId);
          }
        }

        if (imageIds.length > 0) {
          this.imageService.getMultiple(imageIds).subscribe((images: ImageItem[]) => {
            this.loading = false;
            requestSubject.next({});
            requestSubject.complete();
          });
        } else {
          this.loading = false;
          requestSubject.next({});
          requestSubject.complete();
        }
      });
    } else {
      this.loading = false;
      requestSubject.next({});
      requestSubject.complete();
    }

    return requestSubject;
  }

  private populatePotentialGroupMemberChats() {
    this.potentialGroupChatIdToGroupMemberChats = [];
    for (var index = 0; index < this.activeChats.length; index++) {
      var chat = this.activeChats[index];

      if (chat.chatType == ChatType.GROUP) {
        this.populatePotentialGroupMemberChat(chat);
      }
    }
  }

  private populatePotentialGroupMemberChat(chat: Chat) {
    this.potentialGroupChatIdToGroupMemberChats[chat.chatId] = [];

    var mainChatGroupId: number;
    for (var index = 0; index < chat.chatMembers.length; index++) {
      var chatMember = chat.chatMembers[index];
      if (chatMember.groupId && this.myGroupIds.indexOf(chatMember.groupId) >= 0) {
        mainChatGroupId = chatMember.groupId;
      }
    }

    for (var index = 0; index < this.activeChats.length; index++) {
      var activeChat = this.activeChats[index];

      if (activeChat.chatType != ChatType.GROUP_EPHEMERAL || (activeChat.sideGroupId && activeChat.sideGroupId == mainChatGroupId)) {
        continue;
      }

      var foundMainChatGroupId = false;
      var sideChatGroupId: number = null;
      var sideChatUserId: number = null;
      for (var chatMemberIndex = 0; chatMemberIndex < activeChat.chatMembers.length; chatMemberIndex++) {
        var chatMember = activeChat.chatMembers[chatMemberIndex];

        if (chatMember.groupId) {
          if (chatMember.groupId == mainChatGroupId) {
            foundMainChatGroupId = true;
          } else {
            sideChatGroupId = chatMember.groupId;
          }
        } else if (chatMember.userId) {
          sideChatUserId = chatMember.userId;
        }
      }

      if (foundMainChatGroupId) {
        activeChat.sideUserId = sideChatUserId;
        activeChat.sideGroupId = sideChatGroupId;

        this.potentialGroupChatIdToGroupMemberChats[chat.chatId].push(activeChat);
      }
    }
  }

  public populatePotentialGroupsToJoinChats() {
    this.potentialGroupChats = [];
    for (var index = 0; index < this.activeChats.length; index++) {
      var chat = this.activeChats[index];

      if (chat.chatType != ChatType.GROUP_EPHEMERAL) {
        continue;
      }

      var foundUserId = false;
      var sideChatGroupId: number = null;
      var sideChatUserId: number = null;
      for (var chatMemberIndex = 0; chatMemberIndex < chat.chatMembers.length; chatMemberIndex++) {
        var chatMember = chat.chatMembers[chatMemberIndex];

        if (chatMember.userId) {
          if (chatMember.userId == this.myUserId) {
            foundUserId = true;
          } else {
            sideChatUserId = chatMember.userId;
          }
        } else if (chatMember.groupId) {
          sideChatGroupId = chatMember.groupId;
        }
      }

      if (foundUserId) {
        chat.sideUserId = sideChatUserId;
        chat.sideGroupId = sideChatGroupId;

        var foundGroupChatIdToGroupMemberChat = false;
        for (var potentialGroupChatIndex = 0; potentialGroupChatIndex < this.potentialGroupChatIdToGroupMemberChats.length; potentialGroupChatIndex++) {
          var potentialChats = this.potentialGroupChatIdToGroupMemberChats[potentialGroupChatIndex];
          if (!potentialChats) {
            continue;
          }

          for (var chatIndex = 0; chatIndex < potentialChats.length; chatIndex++) {
            var potentialChat = potentialChats[chatIndex];

            if (potentialChat.chatId == chat.chatId) {
              foundGroupChatIdToGroupMemberChat = true;
            }
          }
        }

        if (!foundGroupChatIdToGroupMemberChat) {
          this.potentialGroupChats.push(chat);
        }
      }
    }
  }

  public getTargetUserId(chat: Chat) {
    for (var chatMemberIndex = 0; chatMemberIndex < chat.chatMembers.length; chatMemberIndex++) {
      var chatMember = chat.chatMembers[chatMemberIndex];

      if (chatMember.userId && chatMember.userId != this.myUserId) {
        return chatMember.userId;
      }
    }
    return null;
  }

  public openUserCard(chatMember: UserDetails) {
    this.dialog.open(UserCardDetailsDialogComponent, {
      panelClass: 'details-card-dialog',
      data: {
        user: chatMember,
        disableGroupChat: true
      }
    });
  }


  public getOrderedChatMembers(chatMembers: UserDetails[]) {
    if (!chatMembers || chatMembers.length == 0) {
      return chatMembers;
    }

    var chatMemberIds = [];
    var returnedChatMembers = [];
    for (var index = 0; index < chatMembers.length; index++) {
      var chatMember = chatMembers[index];

      if (chatMemberIds.indexOf(chatMember.id) < 0) {
        chatMemberIds.push(chatMember.id);
        returnedChatMembers.push(chatMember);
      }
    }

    returnedChatMembers.sort((member1: UserDetails, member2: UserDetails) => {
      if (member1.username > member2.username) {
        return 1;
      }

      if (member1.username < member2.username) {
        return -1;
      }

      return 0;
    });

    return returnedChatMembers;
  }

  public getOrderedChats(chats: Chat[], chatTypes: ChatType[]) {
    if (!chats || chats.length == 0) {
      return chats;
    }

    var chatIds = [];
    var chatsToReturn = [];
    for (var index = 0; index < chats.length; index++) {
      var chat = chats[index];
      if (!chat.active) {
        continue;
      }

      if (chatIds.indexOf(chat.chatId) < 0 && (chatTypes.length == 0 || chatTypes.indexOf(chat.chatType) >= 0)) {
        chatIds.push(chat.chatId);
        chatsToReturn.push(chat);
      }
    }

    chatsToReturn.sort((chat1: Chat, chat2: Chat) => {
      return (chat2.lastActivity ? new Date(chat2.lastActivity).getTime() : 0) - (chat1.lastActivity ? new Date(chat1.lastActivity).getTime() : 0);
    });

    return chatsToReturn;
  }

  public combineChats(chats: Chat[], chatsToAdd: Chat[]) {
    if (!chats || chats.length == 0) {
      return chatsToAdd;
    } else if (!chatsToAdd || chatsToAdd.length == 0) {
      return chats;
    }

    var chatIds = [];
    var chatsToReturn = [];
    for (var index = 0; index < chats.length; index++) {
      var chat = chats[index];

      if (chatIds.indexOf(chat.chatId) < 0) {
        chatIds.push(chat.chatId);
        chatsToReturn.push(chat);
      }
    }

    for (var index = 0; index < chatsToAdd.length; index++) {
      var chat = chatsToAdd[index];

      if (chatIds.indexOf(chat.chatId) < 0) {
        chatIds.push(chat.chatId);
        chatsToReturn.push(chat);
      }
    }

    return chatsToReturn;
  }

  public hasAnyUnreadMessages(parentChat: Chat) : boolean {
    if (!this.unreadChatIds) {
      return false;
    }

    if (this.unreadChatIds.indexOf(parentChat.chatId) >= 0) {
      return true;
    }

    var childChats = this.potentialGroupChatIdToGroupMemberChats[parentChat.chatId];
    if (childChats) {
      for (var index = 0; index < childChats.length; index++) {
        if (this.unreadChatIds.indexOf(childChats[index].chatId) >= 0) {
          return true;
        }
      }
    }

    return false;
  }
}
