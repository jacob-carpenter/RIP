import {Component, OnInit, OnDestroy} from '@angular/core';

import {UnreadMessageService} from '../../services/unread-message.service';

import {RoutingService} from '../../services/routing.service';
import {RouteProvider} from '../../../routes/route.provider';

@Component({
  selector: 'messenger-menu',
  templateUrl: './messenger-menu.component.html',
  styleUrls: ['./messenger-menu.component.scss']
})
export class MessengerMenuComponent implements OnInit, OnDestroy {
  public unreadChatIds: number[];

  constructor(
    private routingService: RoutingService,
    private unreadMessageService: UnreadMessageService
  ) {}

  public ngOnInit() {
    this.unreadMessageService.getUnviewedChatIdsFromApi().subscribe((response) => {
      this.unreadChatIds = response;
    });

    this.unreadMessageService.addUnreadChatIdsChangedCallback(this.unreadChatsUpdated.bind(this));
  }

  public ngOnDestroy() {
    this.unreadMessageService.removeUnreadChatIdsChangedCallback(this.unreadChatsUpdated.bind(this));
  }

  public navigateToMessenger() {
    this.routingService.navigateTo(RouteProvider.getMessengerRoute(), {});
  }

  public unreadChatsUpdated = (unreadChatIds: number[]) => {
    this.unreadChatIds = unreadChatIds;
  }

}
