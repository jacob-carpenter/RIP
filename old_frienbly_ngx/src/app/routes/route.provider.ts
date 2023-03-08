
import { Routes, Route } from '@angular/router';

import { DashboardComponent } from '../dashboard/dashboard-page.component';
import { AboutUsComponent } from '../static-pages/about-us/about-us-page.component';
import { PrivacyPolicyComponent } from '../static-pages/privacy-policy/privacy-policy-page.component';
import { SafetyPageComponent } from '../static-pages//safety/safety-page.component';
import { TermsComponent } from '../static-pages/terms/terms-page.component';
import { FeedbackPageComponent } from '../static-pages/feedback/feedback-page.component';
import { SplashComponent } from '../splash/splash-page.component';
import { EmailVerificationComponent } from '../splash/verification/email-verification.component';
import { MessengerComponent } from '../messenger/components/messenger/messenger.component';
import { EventViewportComponent } from '../events/viewport/event-viewport.component';

import { NavigationGuard } from '../common/components/guards/navigation.guard';

export class RouteProvider {

  static getRoutes(): Routes {
    return [
      RouteProvider.getUserAccountSettingsRoute(),
      RouteProvider.getGroupSettingsRoute(),
      RouteProvider.getGroupSearchRoute(),
      RouteProvider.getHomeRoute(),
      RouteProvider.getSearchRoute(),
      RouteProvider.getMessengerRoute(),
      RouteProvider.getEventRoute(),
      RouteProvider.getAboutUsRoute(),
      RouteProvider.getFeedbackRoute(),
      RouteProvider.getPrivacyPolicyRoute(),
      RouteProvider.getSafetyRoute(),
      RouteProvider.getTermsRoute(),
      RouteProvider.getSplashRoute(),
      RouteProvider.getVerifyEmailRoute(),
      RouteProvider.getUnknownRoute()
    ];
  }

  static getUserAccountSettingsRoute(): Route {
    return {
      path: 'user-settings',
      component: DashboardComponent,
      canDeactivate: [NavigationGuard]
    };
  }

  static getGroupSettingsRoute(): Route {
    return {
      path: 'group-settings',
      component: DashboardComponent,
      canDeactivate: [NavigationGuard]
    };
  }

  static getGroupSearchRoute(): Route {
    return {
      path: 'group-search',
      component: DashboardComponent
    };
  }

  static getHomeRoute(): Route {
    return {
      path: 'home',
      component: DashboardComponent
    };
  }

  static getSearchRoute(): Route {
    return {
      path: 'search',
      component: DashboardComponent
    };
  }

  static getMessengerRoute(): Route {
    return {
      path: 'messenger',
      component: MessengerComponent
    };
  }

  static getEventRoute(): Route {
    return {
      path: 'events',
      component: EventViewportComponent
    };
  }

  static getAboutUsRoute(): Route {
    return {
      path: 'aboutus',
      component: AboutUsComponent
     };
  }

  static getPrivacyPolicyRoute(): Route {
    return {
      path: 'privacypolicy',
      component: PrivacyPolicyComponent
     };
  }

  static getSafetyRoute(): Route {
    return {
      path: 'safety',
      component: SafetyPageComponent
     };
  }

  static getTermsRoute(): Route {
    return {
      path: 'terms',
      component: TermsComponent
     };
  }

  static getFeedbackRoute(): Route {
    return {
      path: 'feedback',
      component: FeedbackPageComponent
     };
  }

  static getSplashRoute(): Route {
    return {
      path: 'welcome',
      component: SplashComponent
    };
  }

  static getVerifyEmailRoute(): Route {
    return {
      path: 'verifyemail',
      component: EmailVerificationComponent
    };
  }

  static getUnknownRoute(): Route {
    return {
      path: '**',
      redirectTo: 'welcome'
    };
  }
}
