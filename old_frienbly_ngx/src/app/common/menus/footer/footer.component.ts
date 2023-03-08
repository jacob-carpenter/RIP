import { Component } from '@angular/core';

import {RouteProvider} from '../../../routes/route.provider';
import {UserService} from '../../services/user.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {

  constructor(private userService: UserService) {}

  public isUserLoggedIn() {
    return this.userService.getCurrentUserToken() != null;
  }

  navigateToAboutUsPage() {
    window.open(RouteProvider.getAboutUsRoute().path, "_blank");
  }

  navigateToPrivacyPolicyPage() {
    window.open(RouteProvider.getPrivacyPolicyRoute().path, "_blank");
  }

  navigateToSafetyPage() {
    window.open(RouteProvider.getSafetyRoute().path, "_blank");
  }

  navigateToTermsOfServicePage() {
    window.open(RouteProvider.getTermsRoute().path, "_blank");
  }

  navigateToFeedbackPage() {
    window.open(RouteProvider.getFeedbackRoute().path, "_blank");
  }
}
