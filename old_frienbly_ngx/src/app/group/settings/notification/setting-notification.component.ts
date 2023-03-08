import {Injectable, Component, Input, Output, OnInit, EventEmitter, ViewChild, OnDestroy, Inject} from '@angular/core';
import {MatDialog} from '@angular/material';
import {Observable} from 'rxjs/Observable';
import {AsyncSubject} from 'rxjs/AsyncSubject';

import {RoutingService} from '../../../common/services/routing.service';
import {RouteProvider} from '../../../routes/route.provider';

@Component({
  selector: 'group-setting-notification',
  templateUrl: './setting-notification.component.html',
  styleUrls: ['./setting-notification.component.scss']
})
@Injectable()
export class SettingNotificationComponent {

  constructor(
    private routingService: RoutingService
  ) {}

  public navigateToGroupSettings() {
    this.routingService.navigateTo(RouteProvider.getGroupSettingsRoute(), {});
  }
}
