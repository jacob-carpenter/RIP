import {Injectable, Component, Input, Output, OnInit, EventEmitter, ViewChild, OnDestroy, Inject} from '@angular/core';
import {MatDialog} from '@angular/material';

import {ImageItem} from '../../../common/contracts/image/image.item';
import {Event} from '../../../common/contracts/event/event';
import {EventRsvp} from '../../../common/contracts/event/event-rsvp';
import {EventRsvpStatusType} from '../../../common/contracts/event/event-rsvp-status.type';
import {UserDetails} from '../../../common/contracts/user/models/user-details';

import {EventSettingsDialogComponent} from '../settings-dialog/event-settings-dialog.component';
import {EventAttendeeDialog} from './attendee-dialog/event-attendee.dialog';

import {ImageService} from '../../../common/services/image.service';
import {EventSettingsService} from '../../../common/services/events/event-settings.service';

@Component({
  selector: 'event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss']
})
@Injectable()
export class EventCardComponent implements OnInit {
  public EventRsvpStatusType = EventRsvpStatusType;
  public loading: boolean = false;

  public imageSrc: string;
  public currentUserEventRsvp: EventRsvp;

  @Input()
  public event: Event;

  @Input()
  public currentUser: UserDetails;

  constructor(
    private dialog: MatDialog,
    private imageService: ImageService,
    private eventSettingsService: EventSettingsService
  ) {}

  public ngOnInit() {
    if (this.event.imageId) {
      this.imageService.get(this.event.imageId).subscribe(
        (response: ImageItem) => {
          this.imageSrc = 'data:image/jpeg;base64,' + response.image;
        },
        (error) => {
          console.debug(error);
        }
      );
    }

    if (!this.event.eventRsvps) {
      this.event.eventRsvps = [];
    }

    for (var index = 0; index < this.event.eventRsvps.length; index++) {
      var eventRsvp = this.event.eventRsvps[index];

      if (eventRsvp.userId == this.currentUser.id) {
        this.currentUserEventRsvp = eventRsvp;
        break;
      }
    }
  }

  public openSettingsView() {
    setTimeout(() => {
      this.eventSettingsService.setSelectedEvent(this.event);
      this.dialog.open(EventSettingsDialogComponent, {
        panelClass: 'event-settings-dialog'
      });
    }, 0);
  }

  public accept() {
    var updated = false;
    if (this.currentUserEventRsvp && this.currentUserEventRsvp.rsvpStatusType != EventRsvpStatusType.ACCEPTED) {
      this.currentUserEventRsvp.rsvpStatusType = EventRsvpStatusType.ACCEPTED;

      updated = true;
    } else if (!this.currentUserEventRsvp) {
      this.currentUserEventRsvp = new EventRsvp();
      this.currentUserEventRsvp.userId = this.currentUser.id;
      this.currentUserEventRsvp.eventId = this.event.eventId;
      this.currentUserEventRsvp.rsvpStatusType = EventRsvpStatusType.ACCEPTED;

      updated = true;
    }

    if (updated) {
      this.eventSettingsService.sendRsvp(this.currentUserEventRsvp);
    }
  }

  public maybe() {
    var updated = false;
    if (this.currentUserEventRsvp && this.currentUserEventRsvp.rsvpStatusType != EventRsvpStatusType.MAYBE) {
      this.currentUserEventRsvp.rsvpStatusType = EventRsvpStatusType.MAYBE;

      updated = true;
    } else if (!this.currentUserEventRsvp) {
      this.currentUserEventRsvp = new EventRsvp();
      this.currentUserEventRsvp.userId = this.currentUser.id;
      this.currentUserEventRsvp.eventId = this.event.eventId;
      this.currentUserEventRsvp.rsvpStatusType = EventRsvpStatusType.MAYBE;

      updated = true;
    }

    if (updated) {
      this.eventSettingsService.sendRsvp(this.currentUserEventRsvp);
    }
  }

  public decline() {
    var updated = false;
    if (this.currentUserEventRsvp && this.currentUserEventRsvp.rsvpStatusType != EventRsvpStatusType.DECLINED) {
      this.currentUserEventRsvp.rsvpStatusType = EventRsvpStatusType.DECLINED;

      updated = true;
    } else if (!this.currentUserEventRsvp) {
      this.currentUserEventRsvp = new EventRsvp();
      this.currentUserEventRsvp.userId = this.currentUser.id;
      this.currentUserEventRsvp.eventId = this.event.eventId;
      this.currentUserEventRsvp.rsvpStatusType = EventRsvpStatusType.DECLINED;

      updated = true;
    }

    if (updated) {
      this.eventSettingsService.sendRsvp(this.currentUserEventRsvp);
    }
  }

  public getRsvpCount(eventRsvpStatusType: EventRsvpStatusType) {
    var count = 0;
    if (!this.event || !this.event.eventRsvps) {
      return count;
    }

    for (var index = 0; index < this.event.eventRsvps.length; index++ ) {
      if (this.event.eventRsvps[index].rsvpStatusType == eventRsvpStatusType) {
        count++;
      }
    }

    return count;
  }

  public openAttendies(eventRsvpStatusType: EventRsvpStatusType) {
    var attendeesForType = [];
    if (!this.event || !this.event.eventRsvps) {
      return;
    }

    for (var index = 0; index < this.event.eventRsvps.length; index++ ) {
      if (this.event.eventRsvps[index].rsvpStatusType == eventRsvpStatusType) {
        attendeesForType.push(this.event.eventRsvps[index].userId);
      }
    }

    if (attendeesForType.length > 0) {
      this.dialog.open(EventAttendeeDialog, {
        panelClass: 'event-attendee-dialog',
        data: {
          userIds: attendeesForType,
          rsvpType: eventRsvpStatusType
        }
      });
    }
  }

}
