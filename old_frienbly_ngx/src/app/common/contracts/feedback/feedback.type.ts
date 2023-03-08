export enum FeedbackType {
  GENERAL, BUG, FEATURE
}

export class FeedbackTypeMap {
  public static feedbackTypes = [
    {name: 'General', value: FeedbackType.GENERAL},
    {name: 'Bug', value: FeedbackType.BUG},
    {name: 'Feature', value: FeedbackType.FEATURE}
  ];
}
