export enum VerificationTokenType {
  ACCOUNT, FORGOT_PASSWORD, CHANGE_EMAIL
}

export class VerificationToken {
    token: string;
    tokenType: VerificationTokenType;
}
