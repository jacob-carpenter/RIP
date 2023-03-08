import {Injectable, OnInit, OnDestroy} from '@angular/core';

import {HttpClient, HttpRequest, HttpEvent, HttpResponse, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {AsyncSubject} from 'rxjs/AsyncSubject';

import {SessionStorageService} from 'ngx-webstorage';

import {UserDetails} from '../../common/contracts/user/models/user-details';
import {Message} from '../../common/contracts/chat/messages/message';
import {GroupMemberType} from '../../common/contracts/group/models/group-member-type';

import {Chat} from '../../common/contracts/chat/chat';

import {MessageRetrievalRequest} from '../../common/contracts/chat/messages/message-retrieval.request';
import {MessageRetrievalReply} from '../../common/contracts/chat/messages/message-retrieval.reply';

import {MessengerService} from '../../common/services/messenger.service';
import {EventService} from '../../common/services/event.service';
import {UnreadMessageService} from '../../common/services/unread-message.service';
import {ChatUserService} from './chat-user.service';
import {UserDetailsService} from '../../user/services/user-details.service';

import {environment} from '../../../environments/environment';

@Injectable()
export class ChatService implements OnInit, OnDestroy {
  private selectedChat: Chat;
  public targetUserId: number;
  public targetGroupId: number;
  public groupChat: Chat;
  public currentUser: UserDetails;

  public constructor(
    private storage: SessionStorageService,
    private httpClient: HttpClient,
    private messengerService: MessengerService,
    private eventService: EventService,
    private chatUserService: ChatUserService,
    private unreadMessageService: UnreadMessageService,
    private userDetailsService: UserDetailsService
  ) {
    this.ngOnInit();
  }

  public ngOnInit() {
    this.userDetailsService.get().subscribe((response) => {
      this.currentUser = response;

      this.messengerService.addMessageCallback(this.messageCallback.bind(this));
      this.eventService.addClearChatCacheCallback(this.clearCacheCallback.bind(this));
    });
  }

  public ngOnDestroy() {
    this.messengerService.removeMessageCallback(this.messageCallback.bind(this));
    this.eventService.removeClearChatCacheCallback(this.clearCacheCallback.bind(this));
    this.chatUserService.ngOnDestroy();
  }

  public clearCacheCallback = () => {
    this.storage.clear(this.getChatsCacheKey());
    this.getChats().subscribe(() => {});
  }

  public messageCallback = (message: Message) => {
    if (this.currentUser.id != message.userId && (!this.selectedChat || this.selectedChat.chatId != message.chatId)) {
      this.unreadMessageService.markChatIdAsNotViewed(message.chatId);
    } else {
      this.unreadMessageService.chatViewed(this.selectedChat);
    }

    this.getChat(message.chatId).subscribe(response => {
      var chatUpdated = false;
      if (!response.active) {
        chatUpdated = true;
        response.active = true;
      }
      response.lastActivity = new Date();

      var chats = this.storage.retrieve(this.getChatsCacheKey()) as Chat[];
      if (chats) {
        var found = false;
        for (var index = 0; index < chats.length; index++) {
          if (chats[index].chatId == response.chatId) {
            chats[index] = response;
            found = true;
          }
        }

        if (!found) {
          chatUpdated = true;
          chats.push(response);
        }
      }

      if (chatUpdated) {
        this.notifyNewChatCallbacks(response);
      }

      this.notifyMessageReceivedCallbacks(response, message);

      var messageReply = this.storage.retrieve(this.getMessageRequestCacheKey(message.chatId)) as MessageRetrievalReply;
      if (messageReply) {
        messageReply.messages.push(message);
      }
    });
  }

  public getSelectedChat() : Chat {
    return this.selectedChat;
  }

  public setSelectedChat(chat: Chat, targetUserId: number, targetGroupId: number, groupChat: Chat) {
    this.selectedChat = chat;
    this.targetUserId = targetUserId;
    this.targetGroupId = targetGroupId;
    this.groupChat = groupChat;

    if (this.selectedChat) {
      this.unreadMessageService.chatViewed(this.selectedChat);
      this.messengerService.sendChatSelected(this.selectedChat);
      this.notifySelectedChatCallbacks(this.selectedChat, this.targetUserId, this.targetGroupId, this.groupChat);
    }
  }

  public sendMessage(
    message: Message,
    chat: Chat
  ) {
    message.chatId = chat.chatId;

    this.messengerService.send('message', message);
  }

  public sendSystemMessage(
    requestId: number,
    message: string,
    chat: Chat
  ) {
    var messageContainer = new Message();
    messageContainer.requestId = requestId;
    messageContainer.chatId = chat.chatId;
    messageContainer.message = message;
    messageContainer.system = true;

    this.messengerService.send('message', messageContainer);
  }

  public getChats() : Observable<Chat[]> {
    var requestSubject = new AsyncSubject<Chat[]>();

    var chats = this.storage.retrieve(this.getChatsCacheKey()) as Chat[];
    if (chats && chats.length > 0) {
      requestSubject.next(chats);
      requestSubject.complete();
      return requestSubject;
    }

    this.httpClient.get(
      environment.apiUrl + '/api/chat',
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    )
    .subscribe(
      (response: Chat[]) => {
        this.storage.store(this.getChatsCacheKey(), response);

        for (var i = 0; i < response.length; i++) {
          var chatId = response[i].chatId;

          this.storage.store(this.getChatByModelCacheKey(response[i]), response[i]);
          this.storage.store(this.getChatByIdCacheKey(chatId), response[i]);
        }

        requestSubject.next(response);
        requestSubject.complete();
      }, (error) => {
        requestSubject.error(error);
        requestSubject.complete();
      }
    );

    return requestSubject;
  }

  private getChatsCacheKey() : string {
    return 'ChatService_getChats';
  }

  public getChat(chatId: number) : Observable<Chat> {
      var requestSubject = new AsyncSubject<Chat>();

      var chat = this.storage.retrieve(this.getChatByIdCacheKey(chatId)) as Chat;
      if (chat != null) {
        requestSubject.next(chat);
        requestSubject.complete();
        return requestSubject;
      }

      this.httpClient.get(
        environment.apiUrl + '/api/chat/' + chatId,
        {
          headers: new HttpHeaders().append('Content-Type', 'application/json')
        }
      )
      .subscribe(
        (response: Chat) => {
          this.storage.store(this.getChatByModelCacheKey(response), response);
          this.storage.store(this.getChatByIdCacheKey(response.chatId), response);
          requestSubject.next(response);
          requestSubject.complete();
        }, (error) => {
          requestSubject.error(error);
          requestSubject.complete();
        }
      );

      return requestSubject;
  }

  public getChatByIdCacheKey(chatId: number) : string {
    return 'ChatService_GetChats_' + chatId;
  }

  public getChatByDetails(chat: Chat) : Observable<Chat> {
      var requestSubject = new AsyncSubject<Chat>();

      var foundChat = this.storage.retrieve(this.getChatByModelCacheKey(chat)) as Chat;
      if (foundChat != null) {
        requestSubject.next(foundChat);
        requestSubject.complete();
        return requestSubject;
      }

      this.httpClient.post(
        environment.apiUrl + '/api/chat/getByDetails',
        chat,
        {
          headers: new HttpHeaders().append('Content-Type', 'application/json')
        }
      )
      .subscribe(
        (response: Chat) => {
          if (response && response.chatId) {
            this.storage.store(this.getChatByModelCacheKey(chat), response);
            this.storage.store(this.getChatByIdCacheKey(response.chatId), response);
          }
          requestSubject.next(response);
          requestSubject.complete();
        }, (error) => {
          requestSubject.error(error);
          requestSubject.complete();
        }
      );

      return requestSubject;
  }

  public getOrCreateChat(chat: Chat) {
    var requestSubject = new AsyncSubject<Chat>();

    var foundChat = this.storage.retrieve(this.getChatByModelCacheKey(chat)) as Chat;
    if (foundChat != null) {
      requestSubject.next(foundChat);
      requestSubject.complete();
      return requestSubject;
    }

    this.httpClient.post(
      environment.apiUrl + '/api/chat',
      chat,
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    )
    .subscribe(
      (response: Chat) => {
        if (response && response.chatId) {
          this.storage.store(this.getChatByModelCacheKey(chat), response);
          this.storage.store(this.getChatByIdCacheKey(response.chatId), response);
        }
        requestSubject.next(response);
        requestSubject.complete();
      }, (error) => {
        requestSubject.error(error);
        requestSubject.complete();
      }
    );

    return requestSubject;
  }

  public getChatByModelCacheKey(chat: Chat) : string {
    let newChat = Object.assign({}, chat);
    newChat.chatId = 0;

    return 'ChatService_GetChatByModel_' + JSON.stringify(newChat);
  }

  private getString(field: any): string {
    return field ? field : '';
  }

  public getMembers(chat: Chat) : Observable<UserDetails[]> {
    var requestSubject = new AsyncSubject<UserDetails[]>();

    var foundUsers = this.storage.retrieve(this.getMemberRequestCacheKey(chat.chatId)) as UserDetails[];
    if (foundUsers) {
      requestSubject.next(foundUsers);
      requestSubject.complete();
      return requestSubject;
    }

    this.httpClient.get(
      environment.apiUrl + '/api/chat/members/' + chat.chatId,
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    )
    .subscribe(
      (response: UserDetails[]) => {
        if (response) {
          this.storage.store(this.getMemberRequestCacheKey(chat.chatId), response);
        }
        requestSubject.next(response);
        requestSubject.complete();
      }, (error) => {
        requestSubject.error(error);
        requestSubject.complete();
      }
    );

    return requestSubject;
  }

  public addChatUser(chat: Chat, user: UserDetails) {
    var foundUsers = this.storage.retrieve(this.getMemberRequestCacheKey(chat.chatId)) as UserDetails[];
    if (foundUsers) {
      foundUsers.push(user);
    }
  }

  private getMemberRequestCacheKey(chatId: number) {
    return 'ChatService_getMemberRequestCacheKey_' + chatId;
  }

  public getMessages(messageRetrievalRequest: MessageRetrievalRequest) : Observable<MessageRetrievalReply> {
      var requestSubject = new AsyncSubject<MessageRetrievalReply>();

      if (!messageRetrievalRequest.endDate) {
        var messageReply = this.storage.retrieve(this.getMessageRequestCacheKey(messageRetrievalRequest.chatId)) as MessageRetrievalReply;
        if (messageReply) {
          requestSubject.next(messageReply);
          requestSubject.complete();
          return requestSubject;
        }
      }

      this.httpClient.post(
        environment.apiUrl + '/api/chat/getMessages',
        messageRetrievalRequest,
        {
          headers: new HttpHeaders().append('Content-Type', 'application/json')
        }
      )
      .subscribe(
        (response: MessageRetrievalReply) => {
          if (response && !messageRetrievalRequest.endDate) {
            this.storage.store(this.getMessageRequestCacheKey(messageRetrievalRequest.chatId), response);
          }
          requestSubject.next(response);
          requestSubject.complete();
        }, (error) => {
          requestSubject.error(error);
          requestSubject.complete();
        }
      );

      return requestSubject;
  }

  private getMessageRequestCacheKey(chatId: number) {
    return 'ChatService_getMessageRequestCacheKey_' + chatId;
  }

  public save(chat: Chat) : Observable<Chat> {
    return this.httpClient.post(
      environment.apiUrl + '/api/chat/save',
      chat,
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    )
    .map(
      (response: Chat) => {
        this.storage.clear(this.getChatsCacheKey());
        this.storage.store(this.getChatByModelCacheKey(response), response);
        this.storage.store(this.getChatByIdCacheKey(response.chatId), response);

        return response;
      }
    );
  }




  private messageReceivedCallbacks: Array<Function> = [];
  private selectedChatCallbacks: Array<Function> = [];
  private newChatCallbacks: Array<Function> = [];

  public addNewChatCallbacks(callback: Function) {
    this.newChatCallbacks.push(callback);
  }

  public removeNewChatCallbacks(callback: Function) {
    var index = this.newChatCallbacks.indexOf(callback);
    if (index >= 0) {
      this.newChatCallbacks.splice(index, 1);
    }
  }

  public notifyNewChatCallbacks(chat: Chat) {
    for (var i = 0; i < this.newChatCallbacks.length; i++) {
      this.newChatCallbacks[i](chat);
    }
  }

  public addMessageReceivedCallback(callback: Function) {
    this.messageReceivedCallbacks.push(callback);
  }

  public removeMessageReceivedCallback(callback: Function) {
    var index = this.messageReceivedCallbacks.indexOf(callback);
    if (index >= 0) {
      this.messageReceivedCallbacks.splice(index, 1);
    }
  }

  public notifyMessageReceivedCallbacks(chat: Chat, message: Message) {
    for (var i = 0; i < this.messageReceivedCallbacks.length; i++) {
      this.messageReceivedCallbacks[i](chat, message);
    }
  }

  public addSelectedChatCallback(callback: Function) {
    this.selectedChatCallbacks.push(callback);
  }

  public removeSelectedChatCallback(callback: Function) {
    var index = this.selectedChatCallbacks.indexOf(callback);
    if (index >= 0) {
      this.selectedChatCallbacks.splice(index, 1);
    }
  }

  public notifySelectedChatCallbacks(chat: Chat, targetUserId: number, targetGroupId: number, groupChat: Chat) {
    for (var i = 0; i < this.selectedChatCallbacks.length; i++) {
      this.selectedChatCallbacks[i](chat, targetUserId, targetGroupId, groupChat);
    }
  }
}
