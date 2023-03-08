import {Injectable} from '@angular/core';

import {HttpClient, HttpRequest, HttpEvent, HttpResponse, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {AsyncSubject} from 'rxjs/AsyncSubject';

import {SessionStorageService} from 'ngx-webstorage';

import {environment} from '../../../environments/environment';

import {Block} from '../../common/contracts/user/models/attributes/block';
import {Message} from '../../common/contracts/chat/messages/message';

@Injectable()
export class BlockService {
  public constructor(
    private storage: SessionStorageService,
    private httpClient: HttpClient
  ) {
    this.getBlockedUserIds().subscribe(() => {});
  }

  public canSeeMessage(message: Message) : boolean {
    var blockedIds = this.storage.retrieve(this.getBlockedUserIdsCacheKey()) as number[];
    if (blockedIds && blockedIds.length > 0 && !message.system && !message.eventId) {
      if (blockedIds.indexOf(message.userId) >= 0) {
        return false;
      }
    }
    return true;
  }

  public getBlockedUserIds() : Observable<number[]> {
    var requestSubject = new AsyncSubject<number[]>();

    var blockedIds = this.storage.retrieve(this.getBlockedUserIdsCacheKey()) as number[];
    if (blockedIds) {
      requestSubject.next(blockedIds);
      requestSubject.complete();
      return requestSubject;
    }

    this.httpClient.get(
      environment.apiUrl + '/api/user/block',
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    )
    .subscribe(
      (response: Block[]) => {
        var blockedIds = [];
        for (var index = 0; index < response.length; index++) {
          blockedIds.push(response[index].targetUserId);
        }

        this.storage.store(this.getBlockedUserIdsCacheKey(), blockedIds);

        this.notifyBlocksAlteredCallbacks(blockedIds);

        requestSubject.next(blockedIds);
        requestSubject.complete();
      }, (error) => {
        requestSubject.error(error);
        requestSubject.complete();
      }
    );

    return requestSubject;
  }

  public getBlockedUserIdsCacheKey() {
    return 'BlockService_getBlockedUserIds';
  }

  public blockUser(userId: number) : Observable<any> {
    return this.httpClient.post(
      environment.apiUrl + '/api/user/block/' + userId,
      null,
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    )
    .map(
      (response) => {
        var blockedIds = this.storage.retrieve(this.getBlockedUserIdsCacheKey()) as number[];
        if (!blockedIds) {
          blockedIds = [];
          this.storage.store(this.getBlockedUserIdsCacheKey(), blockedIds);
        }

        if (blockedIds.indexOf(userId) < 0) {
          blockedIds.push(userId);
        }

        this.notifyBlocksAlteredCallbacks(blockedIds);
      }, (error) => {}
    );
  }

  public unblockUser(userId: number) : Observable<any> {
    return this.httpClient.post(
      environment.apiUrl + '/api/user/unblock/' + userId,
      null,
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    )
    .map(
      (response) => {
        var blockedIds = this.storage.retrieve(this.getBlockedUserIdsCacheKey()) as number[];
        if (!blockedIds) {
          blockedIds = [];
          this.storage.store(this.getBlockedUserIdsCacheKey(), blockedIds);
        }

        var index = blockedIds.indexOf(userId);
        if (index >= 0) {
          blockedIds.splice(index, 1);
        }

        this.notifyBlocksAlteredCallbacks(blockedIds);
      }, (error) => {}
    );
  }




  private blocksAlteredCallbacks: Array<Function> = [];

  public addBlocksAlteredCallbacks(callback: Function) {
    this.blocksAlteredCallbacks.push(callback);
  }

  public removeBlocksAlteredCallbacks(callback: Function) {
    var index = this.blocksAlteredCallbacks.indexOf(callback);
    if (index >= 0) {
      this.blocksAlteredCallbacks.splice(index, 1);
    }
  }

  public notifyBlocksAlteredCallbacks(blockedIds: number[]) {
    for (var i = 0; i < this.blocksAlteredCallbacks.length; i++) {
      this.blocksAlteredCallbacks[i](blockedIds);
    }
  }

}
