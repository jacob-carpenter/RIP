import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {AsyncSubject} from 'rxjs/AsyncSubject';

import {HttpRequest, HttpClient, HttpParams, HttpHeaders, HttpEvent, HttpResponse} from "@angular/common/http";
import {SessionStorageService} from 'ngx-webstorage';

import {SexType} from '../../common/contracts/user/models/sex.type';

import {UserService} from '../../common/services/user.service';
import {UserDetailsChangeListener} from './user-details.change.listener';

import {UserDetails} from '../../common/contracts/user/models/user-details';

import {environment} from '../../../environments/environment';

@Injectable()
export class UserDetailsService {

  userDetailsChangeListeners: UserDetailsChangeListener[] = new Array<UserDetailsChangeListener>();

  constructor(
    private httpClient: HttpClient,
    private storage: SessionStorageService,
    private userService: UserService
  ) { }

  public registerUserDetailsChangeListener(userDetailsChangeListener: UserDetailsChangeListener) {
    this.userDetailsChangeListeners.push(userDetailsChangeListener);
  }

  public unregisterUserDetailsChangeListener(userDetailsChangeListener: UserDetailsChangeListener) {
    var index = this.userDetailsChangeListeners.indexOf(userDetailsChangeListener, 0);
    if (index > -1) {
       this.userDetailsChangeListeners.splice(index, 1);
    }
  }

  public areRequiredSettingsEntered(user: UserDetails) {
    return user.imageId && user.userTags.length >= 3 && user.sex != SexType.UNKNOWN;
  }

  public get() : Observable<UserDetails> {
    var requestSubject = new AsyncSubject<UserDetails>();
    var userDetails = this.storage.retrieve(this.getUserDetailsCacheKey()) as any;
    if (userDetails != null) {
      requestSubject.next(userDetails);
      requestSubject.complete();
      return requestSubject;
    }

    this.httpClient.get(
      environment.apiUrl + '/api/user/details',
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    )
    .subscribe(
      (response: UserDetails) => {
        this.storage.store(this.getUserDetailsCacheKey(), response);
        requestSubject.next(response);
        requestSubject.complete();
      }, (error) => {
        requestSubject.error(error);
        requestSubject.complete();
      }
    );

    return requestSubject;
  }

  public getById(userId: number) : Observable<UserDetails> {
    return this.getMultiple([userId]).map(
      (response: UserDetails[]) => response[0]
    )
  }

  public getMultiple(userIds: number[]) : Observable<UserDetails[]> {
    var requestedUserIds: number[] = new Array<number>();
    var foundUserDetails : UserDetails[] = new Array<UserDetails>();
    for (var index = 0; index < userIds.length; index++) {
      var userId = userIds[index];

      var userDetails = this.storage.retrieve(this.getUserDetailsByIdCacheKey(userId)) as UserDetails;

      if (userDetails) {
        foundUserDetails.push(userDetails);
      } else {
        requestedUserIds.push(userId);
      }
    }

    var requestSubject = new AsyncSubject<UserDetails[]>();
    if (requestedUserIds.length == 0) {
        requestSubject.next(foundUserDetails);
        requestSubject.complete();
        return requestSubject;
    }

    this.httpClient.post(
      environment.apiUrl + '/api/user/details/byIds',
      requestedUserIds,
      {}
    ).subscribe(
      (response: UserDetails[]) => {
        for (var index = 0; index < response.length; index++) {
          var userDetails: UserDetails = response[index];

          this.storage.store(this.getUserDetailsByIdCacheKey(userDetails.id), userDetails);

          foundUserDetails.push(userDetails);
        }

        requestSubject.next(foundUserDetails);
        requestSubject.complete();
      },
      (error) => {
        requestSubject.error(error);
        requestSubject.complete();
      }
    )

    return requestSubject;
  }

  private getUserDetailsByIdCacheKey(userId: number) {
    return 'UserDetailsService_getUserDetailsByIdCacheKey_' + userId;
  }

  public save(userDetails: UserDetails) {
    return this.httpClient.post(
      environment.apiUrl + '/api/user/details',
      userDetails,
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    )
    .map(
      (response: UserDetails) => {
        response.username = (this.storage.retrieve(this.getUserDetailsCacheKey()) as UserDetails).username;
        this.storage.store(this.getUserDetailsCacheKey(), response);
        for (var index in this.userDetailsChangeListeners) {
          this.userDetailsChangeListeners[index].handleUserDetailsChange(response);
        }
        return response;
      }
    )
    .catch((response) => Observable.throw(response));
  }

  private getUserDetailsCacheKey() {
    return 'UserDetailsService_currentUser';
  }

  public changePassword(currentPassword: string, newPassword: string) : Observable<boolean> {
    return this.httpClient.post(
      environment.apiUrl + '/api/user/changepassword',
      {
        currentPassword: currentPassword,
        newPassword: newPassword
      },
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    ).map((response: boolean) => response);
  }

  public changeEmail(newEmail: string) : Observable<boolean> {
    return this.httpClient.post(
      environment.apiUrl + '/api/user/changeemail',
      newEmail,
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    ).map((response: boolean) => response);
  }

  public deactivateUser() : Observable<any> {
    return this.httpClient.post(
      environment.apiUrl + '/api/user/deactivate',
      null,
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    );
  }
}
