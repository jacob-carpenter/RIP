import {FeedbackType} from './feedback.type';

export class Feedback {
  feedbackId: number;
  userId: number;
  feedback: string;
  feedbackType: FeedbackType;
  sentTime: Date;
}
