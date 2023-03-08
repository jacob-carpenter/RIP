import {Component, Inject, Input, ElementRef, ViewChild, Pipe, PipeTransform, OnInit, OnDestroy} from '@angular/core';
import {MatDialog} from '@angular/material';

import {Chat} from '../../../../common/contracts/chat/chat';
import {Message} from '../../../../common/contracts/chat/messages/message';
import {UserDetails} from '../../../../common/contracts/user/models/user-details';
import {Event} from '../../../../common/contracts/event/event';

import {BlockService} from '../../../../common/services/block.service';
import {EmojiService} from '../../../services/emojis/emoji.service';
import {ChatService} from '../../../services/chat.service';
import {ChatUserService} from '../../../services/chat-user.service';
import {EventSettingsService} from '../../../../common/services/events/event-settings.service';
import {ImageService} from '../../../../common/services/image.service';

import { UserCardDetailsDialogComponent } from '../../../../user/card/details/user-card.details.dialog';

import {environment} from '../../../../../environments/environment';

@Component({
  selector: 'message-display',
  templateUrl: './message-display.component.html',
  styleUrls: ['./message-display.component.scss']
})
export class MessageDisplayComponent implements OnInit, OnDestroy {
  public environment = environment;

  public loading: boolean = true;

  @Input()
  public chat: Chat;

  @Input()
  set activeMessages(messages: Array<Message>) {
    this.dateBasedMessageBuckets = new Array<{dateId: Date, messages: Message[]}>();
    var dateBasedMessages: {[dateId: string] : Message[]} = {};
    setTimeout(() => {
      messages.sort((message1: Message, message2: Message) => {
        return (message1.sentDateTime ?  new Date(message1.sentDateTime).getTime() : 0) - (message2.sentDateTime ?  new Date(message2.sentDateTime).getTime() : 0);
      });

      for (var index = 0; index < messages.length; index++) {
        var message = messages[index];

        if (this.messageIds.indexOf(message.messageId) >= 0 || !this.blockService.canSeeMessage(message)) {
          continue;
        }

        if (message.eventId && this.eventIds.indexOf(message.eventId) < 0) {
          this.eventIds.push(message.eventId);
        }
        this.messageIds.push(message.messageId);

        message.message = this.emojiService.emojify(message.message);

        var date = new Date(message.sentDateTime);
        date.setHours(0,0,0,0);

        var dateMessages = dateBasedMessages[date.toString()];
        if (!dateMessages) {
          dateMessages = [];
          dateBasedMessages[date.toString()] = dateMessages;
        }

        dateMessages.push(message);
      }

      for (var key in dateBasedMessages) {
        this.dateBasedMessageBuckets.push({dateId: new Date(key), messages: dateBasedMessages[key]});
      }

      if (this.eventIds.length > 0) {

        this.eventSettingsService.getByIds(this.eventIds).subscribe((events) => {
          var imageIds = [];
          for (var index = 0; index < this.eventIds.length; index++) {
            var event = events[index];

            this.eventIdToEvent[event.eventId] = event;

            if (event.imageId && imageIds.indexOf(event.imageId) < 0) {
              imageIds.push(event.imageId);
            }
          }

          if (imageIds.length > 0) {
            this.imageService.getMultiple(imageIds).subscribe(() => {
              this.loading = false;
            });
          } else {
            this.loading = false;
          }

        });
      } else {
        this.loading = false;
      }
    }, 0);
  }

  public messageIds = [];

  public dateBasedMessageBuckets: Array<{dateId: Date, messages: Message[]}> = new Array<{dateId: Date, messages: Message[]}>();

  public eventIds: number[] = [];
  public eventIdToEvent: any = {};

  @Input()
  public chatUsers: {};

  @Input()
  public currentUser: UserDetails;

  public activeChatUserIds: number[] = [];

  public constructor(
    private blockService: BlockService,
    private chatService: ChatService,
    private chatUserService: ChatUserService,
    private dialog: MatDialog,
    private imageService: ImageService,
    private emojiService: EmojiService,
    private eventSettingsService: EventSettingsService
  ) {
  }

  public ngOnInit() {
    this.activeChatUserIds = this.chatUserService.loggedInUsers;
    this.chatUserService.addActiveChatUsersChangedCallback(this.activeChatUsersChanged.bind(this));
    this.eventSettingsService.registerEventUpdateListener(this.eventUpdated.bind(this));

    this.chatService.addMessageReceivedCallback(this.addMessage.bind(this));
  }

  public ngOnDestroy() {
    this.chatUserService.removeActiveChatUsersChangedCallback(this.activeChatUsersChanged.bind(this));
    this.eventSettingsService.unregisterEventUpdateListener(this.eventUpdated.bind(this));

    this.chatService.removeMessageReceivedCallback(this.addMessage.bind(this));
  }

  public activeChatUsersChanged = (activeChatUserIds: number[]) => {
    this.activeChatUserIds = activeChatUserIds;
  }

  public addMessage = (chat: Chat, newMessage: Message) => {
    if (chat.chatId == this.chat.chatId && this.messageIds.indexOf(newMessage.messageId) < 0 && this.blockService.canSeeMessage(newMessage)) {
      this.messageIds.push(newMessage.messageId);

      newMessage.message = this.emojiService.emojify(newMessage.message);

      if (newMessage.eventId && this.eventIds.indexOf(newMessage.eventId) < 0) {
        this.eventSettingsService.getById(newMessage.eventId).subscribe(event => {
          this.eventIds.push(newMessage.eventId);

          this.eventIdToEvent[newMessage.eventId] = event;
        });
      }

      if (this.dateBasedMessageBuckets.length > 0) {
        var dateKey = new Date(newMessage.sentDateTime);
        dateKey.setHours(0,0,0,0);

        var lastDateBasedBucket = this.dateBasedMessageBuckets[this.dateBasedMessageBuckets.length - 1];
        var messages;
        if (lastDateBasedBucket.dateId.getTime() != dateKey.getTime()) {
          messages = [];
          this.dateBasedMessageBuckets.push({dateId: dateKey, messages: messages});
        } else {
          messages = lastDateBasedBucket.messages;
        }

        messages.push(newMessage);
      } else {
        var dateKey = new Date(newMessage.sentDateTime);
        dateKey.setHours(0,0,0,0);
        this.dateBasedMessageBuckets.push({dateId: dateKey, messages: [newMessage]});
      }
    }
  }

  public eventUpdated = (event: Event) => {
    this.eventIdToEvent[event.eventId] = event;
  }

  public openUserCard(user: UserDetails) {
    this.dialog.open(UserCardDetailsDialogComponent, {
      panelClass: 'details-card-dialog',
      data: {
        user: user,
        disableGroupChat: true
      }
    });
  }

  public isLongElapsedSentDateTime(message1: Message, message2: Message): boolean {
    var hours = Math.abs(new Date(message1.sentDateTime).getTime() - new Date(message2.sentDateTime).getTime()) / 1000 / 60 / 60;

    return hours > 1;
  }

  public navigateToUrl(url: string) {
    window.open(url, "_blank");
  }
}
