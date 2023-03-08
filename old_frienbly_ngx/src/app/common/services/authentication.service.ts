import {Injectable, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';

import {HttpRequest, HttpClient, HttpParams, HttpHeaders, HttpEvent, HttpResponse} from "@angular/common/http";

import {environment} from '../../../environments/environment';

import {SessionStorageService} from 'ngx-webstorage';

import {EventService} from '../../common/services/event.service';
import {UserService} from './user.service';
import {Router} from '@angular/router';

import {RevocationRequest} from '../contracts/auth/requests/revocation.request';
import {UserLoginRequest} from '../contracts/user/requests/user-login.request';
import {User} from '../contracts/user/models/user';
import {UserRegistrationReply} from '../contracts/user/replies/user-registration.reply';

declare let gtag: Function;

@Injectable()
export class AuthenticationService {
  constructor(
    private httpClient: HttpClient,
    private userService: UserService,
    private router: Router,
    private sessionStorage: SessionStorageService,
    private eventService: EventService
  ) { }

  public checkForValidSession() {
    return this.httpClient.get(
      environment.apiUrl + '/api/user/tokencheck'
    );
  }

  public login(userLoginRequest: UserLoginRequest) {
    this.sessionStorage.clear();
    this.eventService.notifyLogoutCallbacks();

    var params = new HttpParams()
      .append('username', userLoginRequest.getUsername())
      .append('password', userLoginRequest.getPassword())
      .append('grant_type', 'password')
      .append('client_id', environment.auth.clientId);

    var headers = new HttpHeaders()
      .append('Authorization', 'Basic ' + btoa(environment.auth.clientId + ":" + environment.auth.clientSecret))
      .append('Content-type', 'application/x-www-form-urlencoded; charset=utf-8');

    return this.httpClient.post(
      environment.apiUrl + '/oauth/token',
      null,
      {
        params: params,
        headers: headers
      }
    ).map((resultJson) => {
      this.userService.setToken(resultJson);
      this.eventService.notifyLoginCallbacks();
    });
  }

  public refreshToken() {
    if (this.userService.getCurrentUserRefreshToken() == null) {
      this.logout();
    }

    var params = new HttpParams()
      .append('grant_type', 'refresh_token')
      .append('refresh_token', this.userService.getCurrentUserRefreshToken());

    var headers = new HttpHeaders()
      .append('Authorization', 'Basic ' + btoa(environment.auth.clientId + ":" + environment.auth.clientSecret))
      .append('Content-type', 'application/x-www-form-urlencoded; charset=utf-8');

    return this.httpClient.post(
      environment.apiUrl + '/oauth/token?' + params.toString(),
      null,
      {
        params: params,
        headers: headers
      }
    ).map((resultJson) => this.userService.setToken(resultJson));
  }

  public logout() {
    gtag('event', 'logout', {
      'event_category': 'access'
    });

    gtag('set', {'user_id': null});

    this.sessionStorage.clear();
    this.eventService.notifyLogoutCallbacks();

    let token = this.userService.getCurrentUserToken();
    if (token == null) {
      this.userService.logout();
      this.router.navigate(['/'], {});
      return;
    }
    var tokenString: string = token.toString();

    this.userService.logout();
    return this.httpClient.post(
      environment.apiUrl + '/oauth/token/revoke',
      new RevocationRequest(tokenString),
      {
        headers: new HttpHeaders({'Content-Type': 'application/json', 'Authorization': 'Bearer '+ tokenString})
      }
    ).subscribe(
      (response) => {
        this.router.navigate(['/'], {});
      },
      (error) => {
        this.router.navigate(['/'], {});
      }
    );
  }

  public register(userRegistrationRequest: User) {
    return this.httpClient.post(
      environment.apiUrl + '/api/user/register',
      userRegistrationRequest,
      {
        headers: new HttpHeaders()
          .append('Content-Type', 'application/json')
          .append('Authorization', 'Basic ' + btoa(environment.auth.clientId + ":" + environment.auth.clientSecret))
      }
    )
    .map((response: HttpResponse<UserRegistrationReply>) => response.body);
  }

  public forgotPassword(username: string) : Observable<boolean> {
    return this.httpClient.post(
      environment.apiUrl + '/api/user/forgotpassword',
      username,
      {
        headers: new HttpHeaders()
          .append('Content-Type', 'application/json')
          .append('Authorization', 'Basic ' + btoa(environment.auth.clientId + ":" + environment.auth.clientSecret))
      }
    ).map((response: boolean) => response);
  }

}
