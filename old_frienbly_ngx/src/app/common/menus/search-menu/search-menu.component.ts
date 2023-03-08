import {Component} from '@angular/core';

import {RoutingService} from '../../services/routing.service';
import {RouteProvider} from '../../../routes/route.provider';

@Component({
  selector: 'search-menu',
  templateUrl: './search-menu.component.html',
  styleUrls: ['./search-menu.component.scss']
})
export class SearchMenuComponent {
  constructor(private routingService: RoutingService) {}

  public navigateToSearch() {
    this.routingService.navigateTo(RouteProvider.getSearchRoute(), {});
  }

}
