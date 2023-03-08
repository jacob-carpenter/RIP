import {UserDetails} from './user-details';

export class User {
  id: number;
  username: string;
  email: string;
  password: string;
  enabled: boolean;

  userDetails: UserDetails;
}
