import { Injectable, Component } from '@angular/core';

import { RoutingService } from './common/services/routing.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
@Injectable()
export class AppComponent {
  private routingService: RoutingService;

  constructor(routingService: RoutingService) {
    this.routingService = routingService;
    this.routingService.ngOnInit();
  }
}
