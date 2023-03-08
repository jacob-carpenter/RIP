import {Injectable, Component, HostListener, OnInit, OnDestroy, Input, ViewChild, ElementRef} from '@angular/core';

import {Chat} from '../../../common/contracts/chat/chat';
import {Request} from '../../../common/contracts/requests/request';

import {ScreenSizeService} from '../../../common/services/screen-size.service'
import {ChatService} from '../../services/chat.service';
import {RequestService} from '../../services/request.service';

import {UserDetails} from '../../../common/contracts/user/models/user-details';
import {GroupDetails} from '../../../common/contracts/group/models/group-details';

import {EventService} from '../../../common/services/event.service';

declare let gtag: Function;

@Component({
  selector: 'messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.scss']
})
export class MessengerComponent implements OnInit, OnDestroy {
  public loading: boolean = false;

  public isMobile: boolean = false;
  public isLeftMenuExpanded: boolean = false;

  public activeChats: Chat[];
  public selectedChat: Chat;
  public targetUserId: number;
  public targetGroupId: number;

  constructor(
    private screenSizeService: ScreenSizeService,
    public chatService: ChatService,
    private eventService: EventService,
    private requestService: RequestService
  ) {}

  public ngOnInit() {
    this.calculateMobileState();
    this.eventService.addClearChatCacheCallback(this.refreshChats.bind(this));
    this.chatService.addSelectedChatCallback(this.setSelectedChat.bind(this));
    this.requestService.addRequestReceivedCallback(this.requestReceived.bind(this))

    this.refreshChats();
  }

  public ngOnDestroy() {
    this.eventService.removeClearChatCacheCallback(this.refreshChats.bind(this));
    this.chatService.removeSelectedChatCallback(this.setSelectedChat.bind(this));
    this.requestService.removeRequestReceivedCallback(this.requestReceived.bind(this))

    this.chatService.setSelectedChat(null, null, null, null);
  }

  private refreshChats = () => {
    this.loading = true;
    var selectedChatId = this.chatService.getSelectedChat() ? this.chatService.getSelectedChat().chatId : null;
    var targetUserId = this.chatService.targetUserId;
    var targetGroupId = this.chatService.targetGroupId;
    var targetGroupChatId = this.chatService.groupChat ? this.chatService.groupChat.chatId : null;

    setTimeout(() => {
      this.chatService.getChats().subscribe((chats) => {
        this.activeChats = chats;

        if (selectedChatId) {
          var selectedChat = null;
          var selectedGroupChat = null;
          for (var index = 0; index < chats.length; index++) {
            var chat = chats[index];
            if (!chat.active) {
              continue;
            }

            if (chat.chatId == selectedChatId) {
              selectedChat = chat;
            }
            if (chat.chatId == targetGroupChatId) {
              selectedGroupChat = chat;
            }
          }

          if (selectedChat) {
            this.chatService.setSelectedChat(selectedChat, targetUserId, targetGroupId, selectedGroupChat);
          }
        }

        setTimeout(() => {
          this.loading = false;
        }, 0);
      });
    }, 0);
  }

  public setSelectedChat = (chat: Chat, targetUserId, targetGroupId) => {
    this.targetUserId = targetUserId;
    this.targetGroupId = targetGroupId;
    this.selectedChat = chat;
    this.isLeftMenuExpanded = false;
  }

  public requestReceived = (request: Request) => {

  }

  @HostListener('window:resize', ['$event'])
    onResize(event) {
       this.calculateMobileState();
  }

  calculateMobileState() {
    var calculatedMobileState = this.screenSizeService.isMobile();
    if (calculatedMobileState != this.isMobile) {
      this.isLeftMenuExpanded = false;
      this.isMobile = calculatedMobileState;
    }
  }

  leftMenuToggled() {
    this.isLeftMenuExpanded = !this.isLeftMenuExpanded;
  }

}
