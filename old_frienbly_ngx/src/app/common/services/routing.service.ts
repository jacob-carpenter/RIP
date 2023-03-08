import { Injectable, OnInit } from '@angular/core';
import { Router, Routes, Route, NavigationEnd, ActivatedRoute } from '@angular/router';

import { SessionStorageService } from 'ngx-webstorage';

import { AuthenticationService } from './authentication.service';
import { UserService } from './user.service';

import { RouteProvider } from '../../routes/route.provider';

declare let gtag: Function;

@Injectable()
export class RoutingService implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private authenticationService: AuthenticationService,
    private sessionStorage: SessionStorageService
  ) {

    // Force login/registration, otherwise prevent login and registration
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd ) {
        var path = this.router.url;
        var cleanedPath = path.replace('/', '');
        gtag('set', 'page_title', cleanedPath);
        gtag('set', 'page_location', path);
        gtag('set', 'page_path', path);

        if (this.userService.getCurrentUserToken() == null) {
          if (this.isNavigatedToOpenUrl()) {
            return;
          }

          this.navigateTo(RouteProvider.getSplashRoute(), {});
        } else if (this.router.url.indexOf('/' + RouteProvider.getSplashRoute().path) == 0) {
          this.navigateTo(RouteProvider.getHomeRoute(), {});
        }
      }
    });
  }

  public ngOnInit() {
    this.sessionStorage.clear();

    if (this.isNavigatedToOpenUrl()) {
      return;
    }

    this.authenticationService.checkForValidSession().subscribe(
      (response) => {
        if (!response) {
          this.authenticationService.logout();
        }
      },
      (error) => {
        this.authenticationService.logout();
      }
    );
  }

  private isNavigatedToOpenUrl() : boolean {
    return this.router.url == '/'
      || this.router.url.indexOf('/' + RouteProvider.getTermsRoute().path) == 0
      || this.router.url.indexOf('/' + RouteProvider.getSafetyRoute().path) == 0
      || this.router.url.indexOf('/' + RouteProvider.getPrivacyPolicyRoute().path) == 0
      || this.router.url.indexOf('/' + RouteProvider.getAboutUsRoute().path) == 0
      || this.router.url.indexOf('/' + RouteProvider.getSplashRoute().path) == 0
      || this.router.url.indexOf('/' + RouteProvider.getVerifyEmailRoute().path) == 0;
  }

  navigateTo(route: Route, parameters: object) {
    if (route.path == null || route.path === '') {
      this.router.navigate(['/']);
    } else {
      this.router.navigate([route.path], parameters)
    }
  }
}
