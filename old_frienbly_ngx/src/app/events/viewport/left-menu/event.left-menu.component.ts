import {Injectable, Component, Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';

import {UserDetails} from '../../../common/contracts/user/models/user-details';
import {Event} from '../../../common/contracts/event/event';
import {EventRsvpStatusType} from '../../../common/contracts/event/event-rsvp-status.type';

import {EventCardDialogComponent} from '../../components/dialogs/event-card.dialog';

import {EventSettingsService} from '../../../common/services/events/event-settings.service';
import {UserDetailsService} from '../../../user/services/user-details.service';

@Component({
  selector: 'event-left-menu',
  templateUrl: './event.left-menu.component.html',
  styleUrls: ['./event.left-menu.component.scss']
})
export class EventLeftMenuComponent implements OnInit {
  public loading: boolean = false;

  public events: Array<Event> = [];

  public currentUser: UserDetails;

  @Input()
  public isLeftMenuExpanded: boolean;
  @Input()
  public isMobile: boolean;

  constructor(
    private dialog: MatDialog,
    public eventSettingsService: EventSettingsService,
    private userDetailsService: UserDetailsService
  ) {}

  public ngOnInit() {
    this.eventSettingsService.registerEventUpdateListener(this.eventUpdated.bind(this));

    this.loading = true;
    this.eventSettingsService.showDeclined = false;

    this.userDetailsService.get().subscribe((user) => {
      this.currentUser = user;
      this.eventSettingsService.get().subscribe((events) => {
        events.sort((event1: Event, event2: Event) => {
          return (event1.eventDateTime ?  new Date(event1.eventDateTime).getTime() : 0) - (event2.eventDateTime ?  new Date(event2.eventDateTime).getTime() : 0);
        });

        this.events = events;
        this.loading = false;
      });
    });
  }

  public ngOnDestroy() {
    this.eventSettingsService.unregisterEventUpdateListener(this.eventUpdated.bind(this));
  }

  public eventUpdated = (event: Event) => {
    var found = false;
    for (var index = 0; index < this.events.length; index++) {
      var foundEvent = this.events[index];

      if (foundEvent.eventId == event.eventId) {
        found = true;
        this.events[index] = event;
        break;
      }
    }

    if (!found) {
      this.events.push(event);
    }

    this.events.sort((event1: Event, event2: Event) => {
      return (event1.eventDateTime ?  new Date(event1.eventDateTime).getTime() : 0) - (event2.eventDateTime ?  new Date(event2.eventDateTime).getTime() : 0);
    });
  }

  public getAcceptedOrTentativeEvents(events: Event[]) {
    var shownEvents = [];

    for (var index = 0; index < events.length; index++) {
      var event = events[index];

      if (!event.eventRsvps) {
        shownEvents.push(event);
      }

      var found = false;
      for (var rsvpIndex = 0; rsvpIndex < event.eventRsvps.length; rsvpIndex++) {
        var rsvp = event.eventRsvps[rsvpIndex];

        if (rsvp.userId == this.currentUser.id) {
          found = true;
          if (rsvp.rsvpStatusType != EventRsvpStatusType.DECLINED) {
            shownEvents.push(event);
            break;
          }
        }
      }

      if (!found) {
        shownEvents.push(event);
      }
    }

    return shownEvents;
  }

  public openEventDialog(event: Event) {
    this.eventSettingsService.setSelectedEvent(event);
    setTimeout(() => {
      this.dialog.open(EventCardDialogComponent, {
        panelClass: 'event-card-dialog',
        data: {
          event: event,
          user: this.currentUser
        }
      });
    }, 0);
  }
}
