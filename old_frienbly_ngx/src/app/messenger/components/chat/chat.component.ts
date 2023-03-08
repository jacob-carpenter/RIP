import {Component, Inject, Input, OnInit, OnDestroy, ElementRef, ViewChild, Pipe, PipeTransform} from '@angular/core';

import {Chat} from '../../../common/contracts/chat/chat';
import {Message} from '../../../common/contracts/chat/messages/message';
import {ChatMember} from '../../../common/contracts/chat/chat-member';
import {UserDetails} from '../../../common/contracts/user/models/user-details';
import {GroupDetails} from '../../../common/contracts/group/models/group-details';
import {GroupMemberType} from '../../../common/contracts/group/models/group-member-type';
import {ImageItem} from '../../../common/contracts/image/image.item';

import {MessageRetrievalRequest} from '../../../common/contracts/chat/messages/message-retrieval.request';
import {MessageRetrievalReply} from '../../../common/contracts/chat/messages/message-retrieval.reply';

import {MessengerService} from '../../../common/services/messenger.service';
import {ImageService} from '../../../common/services/image.service';
import {ChatService} from '../../services/chat.service';
import {BlockService} from '../../../common/services/block.service';
import {UserDetailsService} from '../../../user/services/user-details.service';
import {GroupService} from '../../../common/services/groups/group.service';
import {GroupDetailsService} from '../../../group/services/group-details.service';

@Component({
  selector: 'chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {

  public loading: boolean = false;
  public hasMoreHistoricalMessages: boolean = true;

  public activeMessageIds: Array<number> = [];
  public activeMessages: Array<Message> = [];

  public chatUserIds: Array<number> = [];
  public chatUsers: {};

  public currentUser: UserDetails;

  public images: {};

  @ViewChild('messageView')
  public viewport: any;

  @Input()
  public targetUserId: number;

  @Input()
  public targetGroupId: number;

  @Input()
  public disableMessageInputButtons: boolean = false;

  @Input()
  public fillViewport: boolean = false;

  @Input()
  public disableGroupChat: boolean = false;

  @Input()
  public chat: Chat;

  @Input()
  public user: UserDetails;

  @Input()
  public group: GroupDetails;

  public constructor(
    private messengerService: MessengerService,
    private chatService: ChatService,
    private userDetailsService: UserDetailsService,
    private groupService: GroupService,
    private groupDetailsService: GroupDetailsService,
    private imageService: ImageService,
    private blockService: BlockService
  ) {}

  public ngOnInit() {
    this.chatService.addMessageReceivedCallback(this.addMessage.bind(this));
    this.chatService.addSelectedChatCallback(this.setSelectedChat.bind(this));

    var chat: Chat = new Chat();
    chat.chatMembers = [];

    this.loading = true;
    this.userDetailsService.get().subscribe((response: UserDetails) => {
      this.currentUser = response;

      if (!this.chat) {
        var currentGroup = !this.disableGroupChat ? this.groupService.getSelectedGroup() : null;
        if (currentGroup) {
          var myChatMember: ChatMember = new ChatMember();
          myChatMember.groupId = currentGroup.id;
          myChatMember.groupMemberType = GroupMemberType.ADMIN;
          chat.chatMembers.push(myChatMember);
        } else {
          var myChatMember: ChatMember = new ChatMember();
          myChatMember.userId = response.id;
          chat.chatMembers.push(myChatMember);
        }

        var chatMember: ChatMember = new ChatMember();
        if (this.user) {
          chatMember.userId = this.user.id;
          this.targetUserId = this.user.id;
        }

        if (this.group && !this.disableGroupChat) {
          chatMember.groupId = this.group.id;
          chatMember.groupMemberType = GroupMemberType.ADMIN;
          this.targetGroupId = this.group.id;
        }
        chat.chatMembers.push(chatMember);

        this.chatService.getChatByDetails(chat).subscribe((response: Chat) => {
          if (response && !this.chatService.getSelectedChat()) {
            this.chatService.setSelectedChat(response, null, null, null);
            this.messengerService.sendChatSelected(response);
          }
          this.setChat(response ? response : chat);
        },
        (error) => {
          // TODO Pop error dialog?
          console.debug(error);
        });
      } else {
        this.setChat(this.chat);
      }
    });
  }

  public ngOnDestroy() {
    this.chatService.removeMessageReceivedCallback(this.addMessage.bind(this));
    this.chatService.removeSelectedChatCallback(this.setSelectedChat.bind(this));
  }

  public setSelectedChat = (chat: Chat, targetUserId, targetGroupId) => {
    this.loading = true;

    setTimeout(() => {
      this.targetUserId = targetUserId;
      this.targetGroupId = targetGroupId;
      this.setChat(chat);
    }, 0);
  }

  private setChat(chat: Chat) {
    this.hasMoreHistoricalMessages = true;

    this.images = {};

    this.activeMessageIds = [];
    this.activeMessages = [];

    this.chatUserIds = [];
    this.chatUsers = {};

    this.chat = chat;

    if (this.chat && this.chat.chatId) {
      this.chatService.getMembers(this.chat).subscribe((users: UserDetails[]) => {
        var imageIds = [];
        for (var index = 0; index < users.length; index++) {
          var user = users[index];
          this.chatUserIds.push(user.id);
          this.chatUsers[user.id] = user;

          if (user.imageId != null) {
            imageIds.push(user.imageId);
          }
        }

        this.imageService.getMultiple(imageIds).subscribe((images: ImageItem[]) => {
          for (var index = 0; index < images.length; index++) {
            this.images[images[index].imageId] = images[index];
          }
        });

        var messageRetrievalRequest = new MessageRetrievalRequest();
        messageRetrievalRequest.chatId = this.chat.chatId;

        this.chatService.getMessages(messageRetrievalRequest).subscribe((reply: MessageRetrievalReply) => {
          this.hasMoreHistoricalMessages = reply.hasMoreHistoricalMessages;
          for (var index = 0; index < reply.messages.length; index++) {
            var message = reply.messages[index];

            if (this.chatUserIds.indexOf(message.userId) < 0) {
              this.chatUserIds.push(message.userId);
            }

            this.addMessage(this.chat, message);
          }

          this.scrollToBottom();

          this.loading = false;
        });
      });
    } else {
      this.loading = false;
    }
  }

  private scrollToBottom() {
    if (this.viewport) {
      setTimeout(() => {
        this.viewport.scrollTop = this.viewport.scrollHeight - this.viewport.clientHeight;
      }, 0);
    }
  }

  private addMessage = (chat: Chat, newMessage: Message) => {
    var wasAtBottom: boolean = true;

    if (this.viewport) {
      wasAtBottom = this.viewport.scrollTop + this.viewport.clientHeight == this.viewport.scrollHeight;
    }

    if (chat.chatId == this.chat.chatId && this.activeMessageIds.indexOf(newMessage.messageId) < 0) {
      this.activeMessageIds.push(newMessage.messageId);
      this.activeMessages.push(newMessage);

      if (wasAtBottom) {
        this.scrollToBottom();
      }

      if (this.chatUserIds.indexOf(newMessage.userId) < 0) {
        this.userDetailsService.getById(newMessage.userId).subscribe((user: UserDetails) => {
          this.chatUserIds.push(newMessage.userId);
          this.chatUsers[user.id] = user;

          this.chatService.addChatUser(chat, user);

          if (user.imageId != null) {
            this.imageService.get(user.imageId).subscribe((imageResponse: ImageItem) => {
              this.images[imageResponse.imageId] = imageResponse;
            });
          }
        });
      }
    }
  }

  public send(currentMessage: Message) {
    if (currentMessage.message.length > 0) {
      if (this.chat && !this.chat.chatId) {
        this.loading = true;
        this.chatService.getOrCreateChat(this.chat).subscribe((response: Chat) => {
          this.chatService.sendMessage(
            currentMessage,
            response
          );
          this.messengerService.sendChatSelected(response);
          this.setChat(response);
        });
      } else {
        this.chatService.sendMessage(
          currentMessage,
          this.chat
        );
      }
    }
  }
}
