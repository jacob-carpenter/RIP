import {Injectable, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';

import {HttpRequest, HttpClient, HttpParams, HttpHeaders, HttpEvent, HttpResponse} from "@angular/common/http";

import {environment} from '../../../../environments/environment';
import {VerificationToken} from '../../contracts/tokens/verification/verification.token';

@Injectable()
export class VerificationService {
  constructor(
    private httpClient: HttpClient,
    private router: Router
  ) { }

  public verifyAccount(token: string) : Observable<any> {
    return this.httpClient.post(
      environment.apiUrl + '/api/verification/verify/account/' + token,
      null,
      {
        headers: new HttpHeaders()
          .append('Content-Type', 'application/json')
          .append('Authorization', 'Basic ' + btoa(environment.auth.clientId + ":" + environment.auth.clientSecret))
      }
    );
  }

  public verifyForgotPassword(token: string, newPassword: string) : Observable<any> {
    return this.httpClient.post(
      environment.apiUrl + '/api/verification/verify/forgotpassword/' + token,
      newPassword,
      {
        headers: new HttpHeaders()
          .append('Content-Type', 'application/json')
          .append('Authorization', 'Basic ' + btoa(environment.auth.clientId + ":" + environment.auth.clientSecret))
      }
    );
  }

  public verifyChangeEmail(token: string) : Observable<any> {
    return this.httpClient.post(
      environment.apiUrl + '/api/verification/verify/changeemail/' + token,
      null,
      {
        headers: new HttpHeaders()
          .append('Content-Type', 'application/json')
          .append('Authorization', 'Basic ' + btoa(environment.auth.clientId + ":" + environment.auth.clientSecret))
      }
    );
  }

  public get(token: string) : Observable<VerificationToken> {
    return this.httpClient.get(
      environment.apiUrl + '/api/verification/' + token,
      {
        headers: new HttpHeaders()
          .append('Content-Type', 'application/json')
          .append('Authorization', 'Basic ' + btoa(environment.auth.clientId + ":" + environment.auth.clientSecret))
      }
    ).map((response: VerificationToken) => response);
  }
}
