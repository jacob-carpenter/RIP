
import {GroupDetails} from '../../common/contracts/group/models/group-details';

export interface GroupDetailsChangeListener {
  handleGroupDetailsChange(groupDetails: GroupDetails);
}
