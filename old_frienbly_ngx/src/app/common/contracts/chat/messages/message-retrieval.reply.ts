import {Chat} from '../chat';

import {Message} from './message';

export class MessageRetrievalReply {
  hasMoreHistoricalMessages: boolean;
  messages: Message[];
  chatId: number;
}
