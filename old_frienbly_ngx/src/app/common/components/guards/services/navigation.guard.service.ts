import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {AsyncSubject} from 'rxjs/AsyncSubject';

@Injectable()
export class NavigationGuardService {
  private canDeactivateCallback: Function;

  public setCanDeactivateCallback(callback: Function) {
    this.canDeactivateCallback = callback;
  }

  public canDeactivate() : Observable<boolean> {
    if (!this.canDeactivateCallback) {
      var requestSubject = new AsyncSubject<boolean>();
      requestSubject.next(true);
      requestSubject.complete();
      return requestSubject;
    }

    return this.canDeactivateCallback();
  }
}
