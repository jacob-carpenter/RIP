import {ChatMember} from './chat-member';

import {ChatType} from './chat-type';

export class Chat {
  chatId: number;
  chatType: ChatType;
  lastActivity: Date;
  active: boolean;
  chatMembers: ChatMember[];

  sideUserId: number;
  sideGroupId: number;
}
