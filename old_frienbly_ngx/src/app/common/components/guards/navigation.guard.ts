import {Injectable, Component, Input, Output, OnInit, EventEmitter, ViewChild, OnDestroy, Inject} from '@angular/core';
import {CanDeactivate} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {AsyncSubject} from 'rxjs/AsyncSubject';

import {NavigationGuardService} from './services/navigation.guard.service';
import {UserService} from '../../services/user.service';

@Injectable()
export class NavigationGuard implements CanDeactivate<any> {
  constructor(@Inject(NavigationGuardService) private navigationGuardService: NavigationGuardService, @Inject(UserService) private userService: UserService) {}

  public canDeactivate(component: any) : Observable<boolean> {
    if (this.userService.getCurrentUserToken()) {
      return this.navigationGuardService.canDeactivate();
    }

    var requestSubject = new AsyncSubject<boolean>();
    requestSubject.next(true);
    requestSubject.complete();
    return requestSubject;
  }
}
