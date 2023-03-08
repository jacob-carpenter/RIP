import {Injectable, OnInit} from '@angular/core';

import {HttpClient, HttpRequest, HttpEvent, HttpResponse, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {AsyncSubject} from 'rxjs/AsyncSubject';

import {SessionStorageService} from 'ngx-webstorage';

import {UserService} from './user.service';

import {Chat} from '../contracts/chat/chat';

import {environment} from '../../../environments/environment';

@Injectable()
export class UnreadMessageService {
  private unreadChatIdsChangedCallbacks: Array<Function> = [];

  public constructor(
    private storage: SessionStorageService,
    private httpClient: HttpClient,
    private userService: UserService
  ) {}

  public chatViewed(chat: Chat) {
    var unviewedChatIds = this.storage.retrieve(this.getUnviewedChatIdsFromApiCacheKey()) as number[];
    if (!unviewedChatIds) {
      return;
    }

    var index = unviewedChatIds.indexOf(chat.chatId);
    if (index >= 0) {
      unviewedChatIds.splice(index, 1);
    }

    this.notifyUnreadChatIdsChangedCallbacks(unviewedChatIds);
  }

  public markChatIdAsNotViewed(chatId: number) {
    var unviewedChatIds = this.storage.retrieve(this.getUnviewedChatIdsFromApiCacheKey()) as number[];
    if (!unviewedChatIds) {
      return;
    }

    var index = unviewedChatIds.indexOf(chatId);
    if (index < 0) {
      unviewedChatIds.push(chatId);
    }

    this.notifyUnreadChatIdsChangedCallbacks(unviewedChatIds);
  }

  public getUnviewedChatIdsFromApi() : Observable<number[]> {
    var requestSubject = new AsyncSubject<number[]>();

    var unviewedChatIds = this.storage.retrieve(this.getUnviewedChatIdsFromApiCacheKey()) as number[];
    if (unviewedChatIds || !this.userService.getCurrentUserToken()) {
      requestSubject.next(unviewedChatIds || []);
      requestSubject.complete();
      return requestSubject;
    }

    this.httpClient.get(
      environment.apiUrl + '/api/chat/getUnreadChatIds',
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    ).subscribe((response: number[]) => {
      this.storage.store(this.getUnviewedChatIdsFromApiCacheKey(), response);

      this.notifyUnreadChatIdsChangedCallbacks(response);

      requestSubject.next(response);
      requestSubject.complete();
    });

    return requestSubject;
  }

  public getUnviewedChatIdsFromApiCacheKey() {
    return 'UnreadMessageService_getUnviewedChatIdsFromApiCacheKey';
  }



  public addUnreadChatIdsChangedCallback(callback: Function) {
    this.unreadChatIdsChangedCallbacks.push(callback);
  }

  public removeUnreadChatIdsChangedCallback(callback: Function) {
    var index = this.unreadChatIdsChangedCallbacks.indexOf(callback);
    if (index >= 0) {
      this.unreadChatIdsChangedCallbacks.splice(index, 1);
    }
  }

  public notifyUnreadChatIdsChangedCallbacks(chatIds: number[]) {
    for (var i = 0; i < this.unreadChatIdsChangedCallbacks.length; i++) {
      this.unreadChatIdsChangedCallbacks[i](chatIds);
    }
  }
}
