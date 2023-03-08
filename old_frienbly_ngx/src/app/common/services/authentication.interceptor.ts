import {Injectable, Injector} from '@angular/core';

import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse, HttpErrorResponse} from '@angular/common/http';

import {Observable} from 'rxjs/Observable';
import {AsyncSubject} from 'rxjs/AsyncSubject';
import 'rxjs/add/operator/do';

import {environment} from '../../../environments/environment';

import {UserService} from './user.service';
import {AuthenticationService} from './authentication.service';

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {
  constructor(
    private injector: Injector,
    private userService: UserService
  ) {}

  createAuthorizedRequest(request: HttpRequest<any>) : HttpRequest<any> {
    if (request.headers.get('Authorization') == null) {
      return request.clone({
        setHeaders: {
          Authorization: 'Bearer ' + this.userService.getCurrentUserToken()
        }
      });
    }
    return request;
  }

  bypassAuthentication(request: HttpRequest<any>) : boolean {
    for (var endpointIndex in environment.auth.bypassedEndpoints) {
      var endpoint = environment.auth.bypassedEndpoints[endpointIndex];
      if (request.url.indexOf(environment.apiUrl + endpoint) >= 0) {
        return true;
      }
    }
    return request.url.indexOf(environment.apiUrl) < 0;
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    var bypassAuthentication = this.bypassAuthentication(request);
    if (this.userService.getCurrentUserToken() == null && !bypassAuthentication) {
      this.injector.get(AuthenticationService).logout();
    } else if (this.userService.getCurrentUserToken() == null || this.bypassAuthentication(request)) {
      return next.handle(request);
    }

    var request = this.createAuthorizedRequest(request);

    return next.handle(request).catch((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.injector.get(AuthenticationService).refreshToken().catch((error) => {
            console.log(error);
            this.injector.get(AuthenticationService).logout();
            return null;
          }).map((response) => {
            if (!response) {
              this.injector.get(AuthenticationService).logout();
            }

            request.headers.delete('Authorization');
            return next.handle(this.createAuthorizedRequest(request));
          });
        } else {
          console.log(error);
        }
    }).map((response: HttpEvent<any>) => response);
  }
}
