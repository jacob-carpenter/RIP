import {GroupMemberType} from '../group/models/group-member-type';
import {RequestType} from './request.type';

export class Request {
  requestId: number;
  userId: number;
  groupId: number;
  groupMemberType: GroupMemberType;
  targetUserId: number;
  targetGroupId: number;
  targetGroupMemberType: GroupMemberType;
  requestType: RequestType;
  accepted: boolean;
  active: boolean;
}
