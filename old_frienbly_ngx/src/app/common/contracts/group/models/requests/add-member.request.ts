import {GroupMemberType} from '../group-member-type';

export class AddMemberRequest {
  groupId: number;
  memberGroupId: number;
  userId: number;
  groupMemberType: GroupMemberType;
}
