import { NgModule } from '@angular/core';

import { AppCommonModule } from '../common/app-common.module';

import { FeedbackService } from './services/feedback.service';

import { AboutUsComponent } from './about-us/about-us-page.component';
import { FeedbackPageComponent } from './feedback/feedback-page.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy-page.component';
import { SafetyPageComponent } from './safety/safety-page.component';
import { TermsComponent } from './terms/terms-page.component';

@NgModule({
  imports: [
    AppCommonModule
  ],
  declarations: [
    AboutUsComponent,
    PrivacyPolicyComponent,
    SafetyPageComponent,
    TermsComponent,
    FeedbackPageComponent
  ],
  providers: [
    FeedbackService
  ],
  exports: [
    AboutUsComponent,
    PrivacyPolicyComponent,
    SafetyPageComponent,
    TermsComponent,
    FeedbackPageComponent
  ]
})
export class StaticPageModule { }
