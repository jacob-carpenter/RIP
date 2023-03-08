import {Injectable} from '@angular/core';
import {UUID} from 'angular2-uuid';
import { Router, Routes, Route, NavigationEnd } from '@angular/router';

import {HttpClient, HttpRequest, HttpEvent, HttpResponse, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {AsyncSubject} from 'rxjs/AsyncSubject';

import {SessionStorageService} from 'ngx-webstorage';

import * as io from 'socket.io-client';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

import {AuthenticationService} from './authentication.service';
import {UserService} from './user.service';
import {EventService} from './event.service';
import {UnreadMessageService} from './unread-message.service';

import {Message} from '../contracts/chat/messages/message';
import {Request} from '../contracts/requests/request';
import {Chat} from '../contracts/chat/chat';
import {EventRsvp} from '../contracts/event/event-rsvp';

import {environment} from '../../../environments/environment';

declare let gtag: Function;

export enum ConnectionStatus {
  CONNECTED, DISCONNECTED, ACCESS_DENIED
}

@Injectable()
export class MessengerService {
  private messageCallbacks: Array<Function> = [];
  private requestCallbacks: Array<Function> = [];
  private chatUserLoggedInCallbacks: Array<Function> = [];
  private chatUserLoggedOutCallbacks: Array<Function> = [];
  private activeChatUsersCallbacks: Array<Function> = [];
  private hasChatsCallbacks: Array<Function> = [];
  private eventRsvpCallbacks: Array<Function> = [];

  public lastSelectedChat: Chat;

  private socket: any;
  private socketConnected$ = null;

  private hasActiveChats: boolean = false;

  constructor(
    private storage: SessionStorageService,
    private router: Router,
    private httpClient: HttpClient,
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private eventService: EventService,
    private unreadMessageService: UnreadMessageService
  ) {
    this.ngOnInit();
  }

  public ngOnInit() {
    this.connect(true);
    this.eventService.addLoginCallback(this.connectWithRetry.bind(this));
    this.eventService.addLogoutCallback(this.disconnect.bind(this));

    // Force login/registration, otherwise prevent login and registration
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd ) {
        if (this.userService.getCurrentUserToken() != null) {
          if (!this.socket) {
            this.connect(true);

            if (this.lastSelectedChat) {
              this.sendChatSelected(this.lastSelectedChat);
            }
          }
        }
      }
    });
  }

  public ngOnDestroy() {
    this.disconnect();
    this.eventService.removeLoginCallback(this.connectWithRetry.bind(this));
    this.eventService.removeLogoutCallback(this.disconnect.bind(this));
  }

  public connectWithRetry = () => {
    this.connect(true);
  }
  public connect = (retry: boolean) => {
    if (!this.userService.getCurrentUserToken()) {
      return;
    }

    gtag('event', 'socket-io-connect', {
      'event_category': 'messenger'
    });

    var connectionOptions = environment.socket.opts as any;
    connectionOptions.query = 'token=' + this.userService.getCurrentUserToken();
    connectionOptions.origins = environment.socket.allowedOrigins;

    this.socket = io(environment.socket.baseUrl, environment.socket.opts);
    this.socketConnected$ = new BehaviorSubject<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
    this.socket.on('connect', () => this.socketConnected$.next(ConnectionStatus.CONNECTED));
    this.socket.on('access_denied', () => this.socketConnected$.next(ConnectionStatus.ACCESS_DENIED));
    this.socket.on('disconnect', () => this.socketConnected$.next(ConnectionStatus.DISCONNECTED));

    this.socket.on('message', (data: Message) => {
      this.hasActiveChats = true;
      this.notifyMessageCallbacks(data);
      this.notifyHasChatsCallbacks(this.hasActiveChats);
    });

    this.socket.on('request', (data: Request) => {
      this.notifyRequestCallbacks(data);
    });

    this.socket.on('logged_in', (userId: number) => {
      this.notifyChatUserLoggedInCallbacks(userId);
    });

    this.socket.on('logged_out', (userId: number) => {
      this.notifyChatUserLoggedOutCallbacks(userId);
    });

    this.socket.on('active_users', (userIds: number[]) => {
      this.notifyActiveChatUsersCallbacks(userIds);
    });

    this.socket.on('event_rsvp', (eventRsvp: EventRsvp) => {
      this.notifyEventRsvpCallbacks(eventRsvp);
    })

    this.socketConnected$.asObservable().subscribe(connectionStatus => {
      if (connectionStatus == ConnectionStatus.ACCESS_DENIED && retry) {
        this.socket.disconnect();
        this.authenticationService.refreshToken().subscribe((response) => {
          this.connect(false);
        },
        (error) => {
          // TODO How to handle auth failure.. can't reconnect to message socket
          this.authenticationService.logout();
        });
      } else if (connectionStatus == ConnectionStatus.CONNECTED) {
        if (this.lastSelectedChat) {
          this.sendChatSelected(this.lastSelectedChat);
        }
      }
    });
  }

  public disconnect = () => {
    if (this.socket) {
      gtag('event', 'socket-io-disconnect', {
        'event_category': 'messenger'
      });

      this.socket.disconnect();
      this.socket = null;
      this.socketConnected$ = null;
    }
  }

  public send(event: string, item: any) {
    if (!this.socket) {
      this.connect(true);
    }

    gtag('event', event, {
      'event_category': 'messenger'
    });

    this.socket.emit(event, item);
  }

  public sendRsvp(eventRsvp: EventRsvp) {
    this.socket.emit('event_rsvp', eventRsvp);
  }

  public sendChatSelected(chat: Chat) {
    this.lastSelectedChat = chat;

    this.send('chat_selected', {chatId: chat.chatId});

    this.unreadMessageService.chatViewed(chat);
  }

  public hasChats() : Observable<boolean> {
    var requestSubject = new AsyncSubject<boolean>();

    var cachedHasActiveChats = this.storage.retrieve(this.getHasChatsCacheKey()) as boolean;
    if (cachedHasActiveChats || this.hasActiveChats) {
      requestSubject.next(this.hasActiveChats || cachedHasActiveChats);
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
        this.hasActiveChats = response.length > 0;

        this.storage.store(this.getHasChatsCacheKey(), this.hasActiveChats);

        this.notifyHasChatsCallbacks(this.hasActiveChats);
        requestSubject.next(this.hasActiveChats);
        requestSubject.complete();
      }, (error) => {
        requestSubject.error(error);
        requestSubject.complete();
      }
    );

    return requestSubject;
  }

  public getHasChatsCacheKey() {
    return 'MessengerService_getHasChatsCacheKey';
  }



  public addMessageCallback(callback: Function) {
    this.messageCallbacks.push(callback);
  }

  public removeMessageCallback(callback: Function) {
    var index = this.messageCallbacks.indexOf(callback);
    if (index >= 0) {
      this.messageCallbacks.splice(index, 1);
    }
  }

  public notifyMessageCallbacks(message: Message) {
    for (var i = 0; i < this.messageCallbacks.length; i++) {
      this.messageCallbacks[i](message);
    }
  }



  public addRequestCallback(callback: Function) {
    this.requestCallbacks.push(callback);
  }

  public removeRequestCallback(callback: Function) {
    var index = this.requestCallbacks.indexOf(callback);
    if (index >= 0) {
      this.requestCallbacks.splice(index, 1);
    }
  }

  public notifyRequestCallbacks(request: Request) {
    for (var i = 0; i < this.requestCallbacks.length; i++) {
      this.requestCallbacks[i](request);
    }
  }



  public addChatUserLoggedInCallback(callback: Function) {
    this.chatUserLoggedInCallbacks.push(callback);
  }

  public removeChatUserLoggedInCallback(callback: Function) {
    var index = this.chatUserLoggedInCallbacks.indexOf(callback);
    if (index >= 0) {
      this.chatUserLoggedInCallbacks.splice(index, 1);
    }
  }

  public notifyChatUserLoggedInCallbacks(userId: number) {
    for (var i = 0; i < this.chatUserLoggedInCallbacks.length; i++) {
      this.chatUserLoggedInCallbacks[i](userId);
    }
  }



  public addChatUserLoggedOutCallback(callback: Function) {
    this.chatUserLoggedOutCallbacks.push(callback);
  }

  public removeChatUserLoggedOutCallback(callback: Function) {
    var index = this.chatUserLoggedOutCallbacks.indexOf(callback);
    if (index >= 0) {
      this.chatUserLoggedOutCallbacks.splice(index, 1);
    }
  }

  public notifyChatUserLoggedOutCallbacks(userId: number) {
    for (var i = 0; i < this.chatUserLoggedOutCallbacks.length; i++) {
      this.chatUserLoggedOutCallbacks[i](userId);
    }
  }


  public addActiveChatUsersCallback(callback: Function) {
    this.activeChatUsersCallbacks.push(callback);
  }

  public removeActiveChatUsersCallback(callback: Function) {
    var index = this.activeChatUsersCallbacks.indexOf(callback);
    if (index >= 0) {
      this.activeChatUsersCallbacks.splice(index, 1);
    }
  }

  public notifyActiveChatUsersCallbacks(userIds: number[]) {
    for (var i = 0; i < this.activeChatUsersCallbacks.length; i++) {
      this.activeChatUsersCallbacks[i](userIds);
    }
  }


  public addHasChatsCallback(callback: Function) {
    this.hasChatsCallbacks.push(callback);
  }

  public removeHasChatsCallback(callback: Function) {
    var index = this.hasChatsCallbacks.indexOf(callback);
    if (index >= 0) {
      this.hasChatsCallbacks.splice(index, 1);
    }
  }

  public notifyHasChatsCallbacks(hasChats: boolean) {
    for (var i = 0; i < this.hasChatsCallbacks.length; i++) {
      this.hasChatsCallbacks[i](hasChats);
    }
  }


  public addEventRsvpCallback(callback: Function) {
    this.eventRsvpCallbacks.push(callback);
  }

  public removeEventRsvpCallback(callback: Function) {
    var index = this.eventRsvpCallbacks.indexOf(callback);
    if (index >= 0) {
      this.eventRsvpCallbacks.splice(index, 1);
    }
  }

  public notifyEventRsvpCallbacks(eventRsvp: EventRsvp) {
    for (var i = 0; i < this.eventRsvpCallbacks.length; i++) {
      this.eventRsvpCallbacks[i](eventRsvp);
    }
  }
}
