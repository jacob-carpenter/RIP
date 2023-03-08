import {Injectable} from '@angular/core';

import {Cookie} from 'ng2-cookies';

@Injectable()
export class UserService {
  getCurrentUserToken() {
    var cookie = Cookie.get('access_token');
    return cookie != null && cookie.length > 0 ? cookie : null;
  }
  getCurrentUserRefreshToken() {
    var cookie = Cookie.get('refresh_token');
    return cookie != null && cookie.length > 0 ? cookie : null;
  }

  setToken(token){
    var expireDate = new Date().getTime() + (1000 * token.expires_in);
    Cookie.set('access_token', token.access_token, expireDate);
    Cookie.set('refresh_token', token.refresh_token, expireDate * 2);
  }

  logout() {
    Cookie.delete('access_token');
    Cookie.delete('refresh_token');
  }
}
