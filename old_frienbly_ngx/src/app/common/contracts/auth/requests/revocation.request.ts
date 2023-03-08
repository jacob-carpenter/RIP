export class RevocationRequest {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  getAccessToken(): string {
    return this.accessToken;
  }

}
