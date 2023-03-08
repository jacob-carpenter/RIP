import { Injectable } from '@angular/core';

import { SessionStorageService } from 'ngx-webstorage';

import { environment } from '../../../environments/environment';

import { UserService } from '../../common/services/user.service';

@Injectable()
export class RecaptchaService {
  private storedToken: CaptchaToken = null;

  constructor(private storage: SessionStorageService, private userService: UserService) {}

  getSiteKey() {
    return environment.captcha.siteKey;
  }

  getSiteSecret() {
    return environment.captcha.siteSecret;
  }

  setCaptchaToken(captchaToken: string) {
    this.storedToken = new CaptchaToken(captchaToken, new Date().getTime());
    this.storage.store('cptToken', this.storedToken);
  }

  getRecaptchaToken() {
    if (this.storedToken == null) {
      var tokenStorageJson = this.storage.retrieve('cptToken') as any;
      if (tokenStorageJson == null) {
        return null;
      }

      var tokenStorage: CaptchaToken = new CaptchaToken(tokenStorageJson.token, tokenStorageJson.timeInMillis);

      if (new Date().getTime() - tokenStorage.timeInMillis > environment.captcha.expiryInMillis) {
        this.storage.store('cptToken', null);
        return null;
      } else {
        this.storedToken = tokenStorage;
      }
    }

    return this.storedToken.token;
  }

  isCaptchaVerified() {
    return !environment.captcha.enabled || this.getRecaptchaToken() != null || this.userService.getCurrentUserToken() != null;
  }
}

class CaptchaToken {
  token: string;
  timeInMillis: number;

  constructor(token: string, timeInMillis: number) {
    this.token = token;
    this.timeInMillis = timeInMillis;
  }
}
