import {Injectable, Component, OnInit, HostListener} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';

import {ILoginBehavior} from '../user/login/behaviors/login.behavior';
import {ILoginRegisteredEvent} from '../user/login/events/login-registered.event';
import {ILoginFinishedEvent} from '../user/login/events/login-finished.event';

import {IRegistrationBehavior} from '../user/registration/behaviors/registration.behavior';
import {IRegistrationRegisteredEvent} from '../user/registration/events/registration-registered.event';
import {IRegistrationFinishedEvent} from '../user/registration/events/registration-finished.event';

import {ScreenSizeService} from '../common/services/screen-size.service'
import {SplashStatusService} from './services/splash-status.service';

@Component({
  selector: 'splash',
  templateUrl: './splash-page.component.html',
  styleUrls: ['./splash-page.component.scss']
})
@Injectable()
export class SplashComponent implements OnInit {
  feedbackText: string;

  loginStateActive: boolean = false;
  private loginBehavior: ILoginBehavior;
  registrationStateActive: boolean = true;
  private registrationBehavior: IRegistrationBehavior;
  loginRegistrationLoading: boolean = false;

  public isMobile: boolean = false;

  constructor(
    private router: Router,
    private screenSizeService: ScreenSizeService,
    private splashStatusService: SplashStatusService
  ) {}

  public ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd ) {
        window.scrollTo(0, 0);
      }
    });

    this.loginStateActive = this.splashStatusService.previouslyUsedSite();
    this.registrationStateActive = !this.loginStateActive;

    this.calculateMobileState();
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.calculateMobileState();
  }

  public calculateMobileState() {
    this.isMobile = this.screenSizeService.isMobile();
  }

  loginRegistered(event: ILoginRegisteredEvent) {
    this.loginBehavior = event.loginBehavior;
  }
  loginClicked() {
    if (this.registrationStateActive) {
      this.registrationStateActive = false;
    }

    if (!this.loginStateActive) {
      this.loginStateActive = true;
    } else if (this.loginBehavior != null && this.loginBehavior.login()) {
        this.splashStatusService.userLoggedIn();
        this.loginRegistrationLoading = true;
    }
  }
  loginFinished(event: ILoginFinishedEvent) {
    this.loginRegistrationLoading = false;
  }

  registrationRegistered(event: IRegistrationRegisteredEvent) {
    this.registrationBehavior = event.registrationBehavior;
  }
  registrationClicked() {
    if (this.loginStateActive) {
      this.loginStateActive = false;
    }

    if (!this.registrationStateActive) {
      this.registrationStateActive = true;
    } else if (this.registrationBehavior != null && this.registrationBehavior.register()) {
      this.splashStatusService.userLoggedIn();
      this.loginRegistrationLoading = true;
    }
  }
  registrationFinished(event: IRegistrationFinishedEvent) {
    this.loginRegistrationLoading = false;
  }
}
