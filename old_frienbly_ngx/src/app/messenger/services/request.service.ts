import {Injectable, OnInit, OnDestroy} from '@angular/core';

import {HttpClient, HttpRequest, HttpEvent, HttpResponse, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {AsyncSubject} from 'rxjs/AsyncSubject';

import {Request} from '../../common/contracts/requests/request';

import {SessionStorageService} from 'ngx-webstorage';

import {MessengerService} from '../../common/services/messenger.service';
import {EventService} from '../../common/services/event.service';
import {ChatService} from '../services/chat.service';

import {environment} from '../../../environments/environment';

@Injectable()
export class RequestService implements OnInit, OnDestroy {
  private requestReceivedCallbacks = [];

  public constructor(
    private storage: SessionStorageService,
    private httpClient: HttpClient,
    private messengerService: MessengerService,
    private chatService: ChatService,
    private eventService: EventService
  ) {
    this.ngOnInit();
  }

  public ngOnInit() {
    this.messengerService.addRequestCallback(this.requestCallback.bind(this));
  }

  public ngOnDestroy() {
    this.messengerService.removeRequestCallback(this.requestCallback.bind(this));
  }

  public requestCallback = (request: Request) => {
    this.storage.store(this.getRequestByIdCacheKey(request.requestId), request);

    if (request && request.accepted) {
      this.eventService.refreshChatCache();
    }

    if (request.userId && !request.groupId) {
      var requests = this.storage.retrieve(this.getUserRequestsCacheKey(request.userId)) as Request[];

      if (requests) {
        this.addOrReplaceRequest(requests, request);
      }
    }

    if (request.groupId) {
      var requests = this.storage.retrieve(this.getGroupRequestsCacheKey(request.groupId)) as Request[];

      if (requests) {
        this.addOrReplaceRequest(requests, request);
      }
    }

    if (request.targetUserId) {
      var requests = this.storage.retrieve(this.getUserRequestsCacheKey(request.targetUserId)) as Request[];

      if (requests) {
        this.addOrReplaceRequest(requests, request);
      }
    }

    if (request.targetGroupId) {
      var requests = this.storage.retrieve(this.getGroupRequestsCacheKey(request.targetGroupId)) as Request[];

      if (requests) {
        this.addOrReplaceRequest(requests, request);
      }
    }

    this.notifyRequestReceivedCallbacks(request);
  }

  private addOrReplaceRequest(requests: Request[], request: Request) {
    var foundIndex = -1;
    for (var index = 0; index < requests.length; index++) {
      if (request.requestId == requests[index].requestId) {
        foundIndex = index;
      }
    }

    if (foundIndex >= 0) {
      requests.splice(foundIndex, 1);
    }
    requests.push(request);
  }

  public sendRequest(request: Request) {
    this.messengerService.send('request', request);
  }

  public isActiveUserRequest(userId: number, secondUserId: number) : Observable<boolean>  {
    return this.getUserRequests(userId).map((requests) => {
      for (var index = 0; index < requests.length; index++) {
        var request = requests[index];

        if (!request.groupId && !request.targetGroupId && request.active && (request.userId == secondUserId || request.targetUserId == secondUserId)) {
          return true;
        }
      }
    });
  }

  public isActiveUserGroupRequest(userId: number, groupId: number) : Observable<boolean> {
    return this.getGroupRequests(groupId).map((requests) => {
      for (var index = 0; index < requests.length; index++) {
        var request = requests[index];

        if (request.active && (request.userId == userId || request.targetUserId == userId)) {
          return true;
        }
      }
    });
  }

  public isActiveGroupRequest(groupId: number, secondGroupId: number) : Observable<boolean>  {
    return this.getGroupRequests(groupId).map((requests) => {
      for (var index = 0; index < requests.length; index++) {
        var request = requests[index];

        if (request.active && (request.groupId == secondGroupId || request.targetGroupId == secondGroupId)) {
          return true;
        }
      }
    });
  }

  public getUserRequests(userId: number) : Observable<Request[]> {
    var requestSubject = new AsyncSubject<Request[]>();

    var requests = this.storage.retrieve(this.getUserRequestsCacheKey(userId)) as Request[];
    if (requests) {
      requestSubject.next(requests);
      requestSubject.complete();
      return requestSubject;
    }

    this.httpClient.get(
      environment.apiUrl + '/api/requests/byUser/' + userId,
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    )
    .subscribe(
      (response: Request[]) => {
        this.storage.store(this.getUserRequestsCacheKey(userId), response);

        for (var index = 0; index < response.length; index++) {
          var request = response[index];
          this.storage.store(this.getRequestByIdCacheKey(request.requestId), request);
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
  private getUserRequestsCacheKey(userId: number) {
    return 'RequestService_getUserRequestsCacheKey_' + userId;
  }

  public getGroupRequests(groupId: number) : Observable<Request[]> {
    var requestSubject = new AsyncSubject<Request[]>();

    var requests = this.storage.retrieve(this.getGroupRequestsCacheKey(groupId)) as Request[];
    if (requests) {
      requestSubject.next(requests);
      requestSubject.complete();
      return requestSubject;
    }

    this.httpClient.get(
      environment.apiUrl + '/api/requests/byGroup/' + groupId,
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    )
    .subscribe(
      (response: Request[]) => {
        this.storage.store(this.getGroupRequestsCacheKey(groupId), response);

        for (var index = 0; index < response.length; index++) {
          var request = response[index];
          this.storage.store(this.getRequestByIdCacheKey(request.requestId), request);
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
  private getGroupRequestsCacheKey(groupId: number) {
    return 'RequestService_getGroupRequestsCacheKey_' + groupId;
  }

  public getRequestById(requestId: number) : Observable<Request> {
    var requestSubject = new AsyncSubject<Request>();

    var request = this.storage.retrieve(this.getRequestByIdCacheKey(requestId)) as Request;
    if (request) {
      requestSubject.next(request);
      requestSubject.complete();
      return requestSubject;
    }

    this.httpClient.get(
      environment.apiUrl + '/api/requests/' + requestId,
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    )
    .subscribe(
      (response: Request) => {
        this.storage.store(this.getRequestByIdCacheKey(requestId), response);

        requestSubject.next(response);
        requestSubject.complete();
      }, (error) => {
        requestSubject.error(error);
        requestSubject.complete();
      }
    );

    return requestSubject;
  }
  private getRequestByIdCacheKey(requestId: number) {
    return 'RequestService_getRequestByIdCacheKey_' + requestId;
  }

  public saveRequest(request: Request) : Observable<Request> {
    return this.httpClient.post(
      environment.apiUrl + '/api/requests',
      request,
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    )
    .map(
      (response: Request) => {
        this.storage.store(this.getRequestByIdCacheKey(response.requestId), response);

        return response;
      }
    );
  }

  public addRequestReceivedCallback(callback: Function) {
    this.requestReceivedCallbacks.push(callback);
  }

  public removeRequestReceivedCallback(callback: Function) {
    var index = this.requestReceivedCallbacks.indexOf(callback);
    if (index >= 0) {
      this.requestReceivedCallbacks.splice(index, 1);
    }
  }

  public notifyRequestReceivedCallbacks(request: Request) {
    for (var i = 0; i < this.requestReceivedCallbacks.length; i++) {
      this.requestReceivedCallbacks[i](request);
    }
  }
}
