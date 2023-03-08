import {Injectable} from '@angular/core';

@Injectable()
export class EventService {
  private loginCallbacks: Array<Function> = [];
  private logoutCallbacks: Array<Function> = [];

  private clearChatCacheCallbacks: Array<Function> = [];

  public addLoginCallback(callback: Function) {
    this.loginCallbacks.push(callback);
  }

  public removeLoginCallback(callback: Function) {
    var index = this.loginCallbacks.indexOf(callback);
    if (index >= 0) {
      this.loginCallbacks.splice(index, 1);
    }
  }

  public notifyLoginCallbacks() {
    for (var i = 0; i < this.loginCallbacks.length; i++) {
      this.loginCallbacks[i]();
    }
  }

  public addLogoutCallback(callback: Function) {
    this.logoutCallbacks.push(callback);
  }

  public removeLogoutCallback(callback: Function) {
    var index = this.logoutCallbacks.indexOf(callback);
    if (index >= 0) {
      this.logoutCallbacks.splice(index, 1);
    }
  }

  public notifyLogoutCallbacks() {
    for (var i = 0; i < this.logoutCallbacks.length; i++) {
      this.logoutCallbacks[i]();
    }
  }

  public addClearChatCacheCallback(callback: Function) {
    this.clearChatCacheCallbacks.push(callback);
  }

  public removeClearChatCacheCallback(callback: Function) {
    var index = this.clearChatCacheCallbacks.indexOf(callback);
    if (index >= 0) {
      this.clearChatCacheCallbacks.splice(index, 1);
    }
  }

  public refreshChatCache() {
    for (var i = 0; i < this.clearChatCacheCallbacks.length; i++) {
      this.clearChatCacheCallbacks[i]();
    }
  }
}
