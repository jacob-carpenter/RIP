import {Component, OnInit, EventEmitter, Output, Input, ViewChild} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material';

import {ILoginRegisteredEvent} from './events/login-registered.event';
import {ILoginFinishedEvent} from './events/login-finished.event';
import {ILoginBehavior} from './behaviors/login.behavior';

import {UserDetailsService} from '../services/user-details.service';
import {RoutingService} from '../../common/services/routing.service';
import {RouteProvider} from '../../routes/route.provider';

import {UserLoginRequest} from '../../common/contracts/user/requests/user-login.request';

import {RecaptchaService} from '../recaptcha/recaptcha.service';
import {AuthenticationService} from '../../common/services/authentication.service';

import {ForgotPasswordDialogComponent} from './dialogs/forgot-password-dialog.component';

import {environment} from '../../../environments/environment';

declare let gtag: Function;

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, ILoginBehavior{

  @ViewChild('loginForm')
  private loginForm;

  @Output()
  private loginRegistered: EventEmitter<ILoginRegisteredEvent> = new EventEmitter();

  @Output()
  private loginFinished: EventEmitter<ILoginFinishedEvent> = new EventEmitter();

  model: any = {};
  loginFailed: boolean = false;

  constructor(
    private recaptchaService: RecaptchaService,
    private authenticationService: AuthenticationService,
    private routingService: RoutingService,
    private dialog: MatDialog,
    private userDetailsService: UserDetailsService
  ) {}

  ngOnInit() {
    this.loginRegistered.emit(
      {
        loginBehavior: this
      }
    );
  }

  getSiteKey() {
    return this.recaptchaService.getSiteKey();
  }
  isCaptchaVerified() {
    return this.recaptchaService.isCaptchaVerified() || !environment.captcha.enabledOnLogin;
  }
  handleCaptchaResponse(token: string) {
    this.recaptchaService.setCaptchaToken(token);
  }

  login(): boolean {
    if (this.loginForm.form.valid && this.isCaptchaVerified()) {
      this.loginForm.ngSubmit.emit();
      return true;
    } else {
      this.loginForm.form.submitted = true;
      return false;
    }
  }
  handleLoginFormSubmission() {
    this.loginFailed = false;

    this.authenticationService.login(new UserLoginRequest(this.model.username, this.model.password)).subscribe(
      (userResponse) => {
        this.userDetailsService.get().subscribe((userDetails) => {
          gtag('config', 'GA_TRACKING_ID', {
            'user_id': userDetails.id
          });

          gtag('event', 'login', {
            'event_category': 'access'
          });

          this.loginFinished.emit({});
          this.routingService.navigateTo(RouteProvider.getHomeRoute(), {});
        });
      },
      (error) => {
        gtag('event', 'login-failed', {
          'event_category': 'access'
        });
        this.loginFailed = true;
        this.loginFinished.emit({});
      }
    );
  }

  public forgotPassword() {
    let dialogRef = this.dialog.open(ForgotPasswordDialogComponent, {
      width: environment.dialogs.width
    });
  }
}
