import {Component} from '@angular/core';

import {RoutingService} from '../../services/routing.service';
import {RouteProvider} from '../../../routes/route.provider';

@Component({
  selector: 'event-menu',
  templateUrl: './event-menu.component.html',
  styleUrls: ['./event-menu.component.scss']
})
export class EventMenuComponent {
  constructor(
    private routingService: RoutingService
  ) {}

  public viewEvents() {
    this.routingService.navigateTo(RouteProvider.getEventRoute(), {});
  }
}
