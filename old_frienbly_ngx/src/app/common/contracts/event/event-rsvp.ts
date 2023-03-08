import {EventRsvpStatusType} from './event-rsvp-status.type';

export class EventRsvp {
  eventRsvpId: number;
  eventId: number;
  userId: number;
  rsvpStatusType: EventRsvpStatusType;
  rsvpSentTime: Date;
}
