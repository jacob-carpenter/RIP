import {Component, HostListener, OnInit, ViewChild, Output, EventEmitter} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material';

import {IRegistrationRegisteredEvent} from './events/registration-registered.event';
import {IRegistrationFinishedEvent} from './events/registration-finished.event';
import {IRegistrationBehavior} from './behaviors/registration.behavior';
import {ConfirmationDialogComponent} from '../../common/components/dialogs/confirmation/confirmation-dialog.component';

import {RoutingService} from '../../common/services/routing.service';
import {RouteProvider} from '../../routes/route.provider';
import {RecaptchaService} from '../recaptcha/recaptcha.service';
import {AuthenticationService} from '../../common/services/authentication.service';
import {GeolocationService} from '../../common/services/geolocation.service';

import {StreetLocation} from '../../common/contracts/geolocation/street-location';
import {UserLoginRequest} from '../../common/contracts/user/requests/user-login.request';
import {User} from '../../common/contracts/user/models/user';
import {UserDetails} from '../../common/contracts/user/models/user-details';
import {SexType} from '../../common/contracts/user/models/sex.type';
import {UserRegistrationReply} from '../../common/contracts/user/replies/user-registration.reply';
import {UserFieldType} from '../../common/contracts/user/user-field.type';
import {ExceptionType} from '../../common/contracts/exceptions/exception.type';

import { environment } from '../../../environments/environment';

declare let gtag: Function;

@Component({
  selector: 'registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit, IRegistrationBehavior {

  @ViewChild('registrationForm')
  private registrationForm;

  @Output()
  private registrationRegistered: EventEmitter<IRegistrationRegisteredEvent> = new EventEmitter();

  @Output()
  private registrationFinished: EventEmitter<IRegistrationFinishedEvent> = new EventEmitter();

  model: any = {};
  maxDate: Date;
  registrationFailed: boolean = false;
  usernameExists: boolean = false;
  emailExists: boolean = false;

  public isPasswordVisible: boolean = false;

  constructor(
    private recaptchaService: RecaptchaService,
    private authenticationService: AuthenticationService,
    private routingService: RoutingService,
    private geolocationService: GeolocationService,
    private dialog: MatDialog
  ) {
    this.maxDate = new Date();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
  }

  ngOnInit() {
    this.registrationRegistered.emit(
      {
        registrationBehavior: this
      }
    );
  }

  getSiteKey() {
    return this.recaptchaService.getSiteKey();
  }
  isCaptchaVerified() {
    return this.recaptchaService.isCaptchaVerified() || !environment.captcha.enabledOnRegistration;
  }
  handleCaptchaResponse(token: string) {
    this.recaptchaService.setCaptchaToken(token);
  }

  showTermsPage() {
    window.open(RouteProvider.getTermsRoute().path, "_blank");
  }

  register(): boolean {
    if (this.registrationForm.form.valid && !this.usernameExists && !this.emailExists &&  this.isCaptchaVerified()) {
      this.registrationForm.ngSubmit.emit();
      return true;
    } else {
      this.registrationForm.form.submitted = true;
      return false;
    }
  }
  handleRegistrationFormSubmission() {
    this.registrationFailed = false;

    var user: User = this.getUserFromModel();
    this.geolocationService.getCurrentStreetLocation().subscribe(
      (streetLocation: StreetLocation) => {
        user.userDetails.latitude = streetLocation.latitude;
        user.userDetails.longitude = streetLocation.longitude;
        user.userDetails.city = streetLocation.city;
        user.userDetails.province = streetLocation.province;
        user.userDetails.postalCode = streetLocation.postalCode;
        user.userDetails.country = streetLocation.country;

        this.issueRegistration(user);
      },
      (error) => {
        console.log(error);
        user.userDetails.onlineOnly = true;

        this.issueRegistration(user);
      }
    )
  }
  issueRegistration(user: User) {
    this.authenticationService.register(
      user
    ).subscribe(
      (userResponse: UserRegistrationReply) => {
        gtag('event', 'user-registration', {
          'event_category': 'access'
        });

        this.registrationFinished.emit({});

        let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
          width: environment.dialogs.width,
          data: {
            titleText: 'Verify Email',
            bodyText: 'Your account has been registered and a confirmation email has been sent. Click the link in the confirmation email to activate your account.',
            closeButtonText: 'Ok'
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          this.routingService.navigateTo(RouteProvider.getHomeRoute(), {});
        });
      },
      (errorResponse: any) => {
        gtag('event', 'registration-failed', {
          'event_category': 'access'
        });

        this.registrationFinished.emit({});
        this.registrationFailed = true;

        if (errorResponse.error) {
          var parsedError = errorResponse.error;
          if (parsedError.exceptionType == ExceptionType.DUPLICATION) {
            switch (parsedError.erroredField) {
              case UserFieldType.USERNAME:
                this.usernameExists = true;
                break;
              case UserFieldType.EMAIL:
                this.emailExists = true;
                break;
            }
          }
        }
      }
    );
  }

  getUserFromModel() {
    var user = new User();
    user.username = this.model.username;
    user.email = this.model.email;
    user.password = this.model.password;
    user.enabled = true;

    var userDetails = new UserDetails();
    userDetails.birthdate = this.model.birthdate;
    userDetails.lookingForIndividuals = true;
    userDetails.lookingForGroups = true;
    userDetails.sex = SexType.UNKNOWN;
    userDetails.onlineOnly = false;

    user.userDetails = userDetails;
    return user;
  }

}
