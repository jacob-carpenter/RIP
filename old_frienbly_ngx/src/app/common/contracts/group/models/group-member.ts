import {Group} from './group';
import {GroupDetails} from './group-details';
import {UserDetails} from '../../user/models/user-details';
import {GroupMemberType} from './group-member-type';

export class GroupMember {
  groupId: number;
  userId: number;
  group: Group;
  groupDetails: GroupDetails;
  user: UserDetails;
  groupMemberType: GroupMemberType;
}
