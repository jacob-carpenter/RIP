import {Injectable, Component} from '@angular/core';
import { Router, Routes, Route, NavigationEnd  } from '@angular/router';

import {RouteProvider} from '../routes/route.provider';

import {ViewportState} from './viewport.state';

@Component({
  selector: 'viewport',
  templateUrl: './viewport.component.html',
  styleUrls: ['./viewport.component.scss']
})
@Injectable()
export class ViewportComponent {
  ViewportState = ViewportState;
  currentViewportState: ViewportState = ViewportState.SEARCH;

  constructor(private router: Router) {
    // Force login/registration, otherwise prevent login and registration
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd ) {
        if (this.router.url.indexOf('/' + RouteProvider.getUserAccountSettingsRoute().path) == 0) {
          this.currentViewportState = ViewportState.USER_SETTINGS;
        } else if (this.router.url.indexOf('/' + RouteProvider.getGroupSettingsRoute().path) == 0) {
          this.currentViewportState = ViewportState.GROUP_SETTINGS;
        } else {
          this.currentViewportState = ViewportState.SEARCH;
        }
      }
    });
  }
}
