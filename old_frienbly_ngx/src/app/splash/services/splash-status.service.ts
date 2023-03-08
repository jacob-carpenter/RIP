import {Injectable} from '@angular/core';

import {Cookie} from 'ng2-cookies';

@Injectable()
export class SplashStatusService {
  userLoggedIn() {
    Cookie.set('was_logged_in', 'true');
  }

  previouslyUsedSite() {
    var cookie = Cookie.get('was_logged_in');
    return cookie != null && cookie == 'true';
  }
}
