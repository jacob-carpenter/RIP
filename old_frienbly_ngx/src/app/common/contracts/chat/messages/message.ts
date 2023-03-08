import {GroupMemberType} from '../../group/models/group-member-type';

export class Message {
  chatId: number;
  messageId: number;
  userId: number;
  message: string;
  sentDateTime: Date;
  system: boolean;
  imageHeight: number;
  giphyUrl: string;
  imageId: string;
  imageRotation: number;
  eventId: number;
  requestId: number;
}
