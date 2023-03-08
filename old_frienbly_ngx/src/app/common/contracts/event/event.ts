import {EventRsvp} from './event-rsvp';

export class Event {
  eventId: number;
  sentByUserId: number;
  targettedChatId: number;
  isCancelled: boolean;
  cancellationTime: Date;
  imageId: string;
  imageRotation: number;
  sentDateTime: Date;
  eventDateTime: Date;
  eventName: string;
  eventDescription: string;
  locationName: string;
  onlineOnly: boolean;
  latitude: number;
  longitude: number;
  street: string;
  city: string;
  province: string;
  postalCode: number;
  country: string;
  eventRsvps: EventRsvp[];
}
