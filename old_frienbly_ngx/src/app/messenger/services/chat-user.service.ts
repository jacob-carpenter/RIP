import {Injectable, OnInit, OnDestroy} from '@angular/core';

import {MessengerService} from '../../common/services/messenger.service';

@Injectable()
export class ChatUserService implements OnInit, OnDestroy {
  private activeChatUsersChangedCallbacks: Array<Function> = [];

  public loggedInUsers: number[] = [];

  constructor(private messengerService: MessengerService) {
    this.ngOnInit();
  }

  public ngOnInit() {
    this.messengerService.addActiveChatUsersCallback(this.setUserIds.bind(this));
    this.messengerService.addChatUserLoggedInCallback(this.addUserId.bind(this));
    this.messengerService.addChatUserLoggedOutCallback(this.removeUserId.bind(this));
  }

  public ngOnDestroy() {
    this.messengerService.removeActiveChatUsersCallback(this.setUserIds.bind(this));
    this.messengerService.removeChatUserLoggedInCallback(this.addUserId.bind(this));
    this.messengerService.removeChatUserLoggedOutCallback(this.removeUserId.bind(this));
  }

  private addUserId = (userId: number) => {
    var index = this.loggedInUsers.indexOf(userId);
    if (index < 0) {
      this.loggedInUsers.push(userId);
    }

    this.notifyActiveChatUsersChangedCallbacks(this.loggedInUsers);
  }

  private removeUserId = (userId: number) => {
    var index = this.loggedInUsers.indexOf(userId);
    if (index >= 0 ) {
      this.loggedInUsers.splice(index, 1);
    }

    this.notifyActiveChatUsersChangedCallbacks(this.loggedInUsers);
  }

  private setUserIds = (userIds: number[]) => {
    if (userIds) {
      this.loggedInUsers = userIds;
    } else {
      this.loggedInUsers = [];
    }

    this.notifyActiveChatUsersChangedCallbacks(this.loggedInUsers);
  }

  public addActiveChatUsersChangedCallback(callback: Function) {
    this.activeChatUsersChangedCallbacks.push(callback);
  }

  public removeActiveChatUsersChangedCallback(callback: Function) {
    var index = this.activeChatUsersChangedCallbacks.indexOf(callback);
    if (index >= 0) {
      this.activeChatUsersChangedCallbacks.splice(index, 1);
    }
  }

  public notifyActiveChatUsersChangedCallbacks(userIds: number[]) {
    for (var i = 0; i < this.activeChatUsersChangedCallbacks.length; i++) {
      this.activeChatUsersChangedCallbacks[i](userIds);
    }
  }
}
