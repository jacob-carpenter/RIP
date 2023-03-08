import {GroupMemberType} from '../group/models/group-member-type';

export class ChatMember {
  chatMemberId: number;
  chatId: number;
  userId: number;
  groupId: number;
  groupMemberType: GroupMemberType;
}
