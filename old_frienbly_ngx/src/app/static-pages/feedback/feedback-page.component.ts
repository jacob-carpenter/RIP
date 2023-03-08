import { Component } from '@angular/core';

import { Feedback } from '../../common/contracts/feedback/feedback';
import { FeedbackType, FeedbackTypeMap } from '../../common/contracts/feedback/feedback.type';

import { FeedbackService } from '../services/feedback.service';

@Component({
  selector: 'feedback-page',
  templateUrl: './feedback-page.component.html',
  styleUrls: ['./feedback-page.component.scss']
})
export class FeedbackPageComponent {
  public loading: boolean = false;
  public feedbackTypes = FeedbackTypeMap.feedbackTypes;
  public feedback: Feedback;

  constructor (private feedbackService: FeedbackService) {
    this.initializeFeedback();
  }

  public initializeFeedback() {
    this.feedback = new Feedback();
    this.feedback.feedbackType = FeedbackType.GENERAL;
  }

  public sendFeedback() {
    this.loading = true;
    this.feedbackService.sendFeedback(this.feedback).subscribe(() => {
      this.initializeFeedback();
      this.loading = false;
    });
  }
}
