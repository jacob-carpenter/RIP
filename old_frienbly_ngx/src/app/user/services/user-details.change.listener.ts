
import {UserDetails} from '../../common/contracts/user/models/user-details';

export interface UserDetailsChangeListener {
  handleUserDetailsChange(userDetails: UserDetails);
}
