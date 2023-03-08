import {Injectable, Component, Input, Output, OnInit, EventEmitter, ViewChild, OnDestroy, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';

import {Event} from '../../../common/contracts/event/event';
import {UserDetails} from '../../../common/contracts/user/models/user-details';

import {EventSettingsService} from '../../../common/services/events/event-settings.service';

@Component({
  selector: 'event-card-dialog',
  templateUrl: './event-card.dialog.html',
  styleUrls: ['./event-card.dialog.scss']
})
@Injectable()
export class EventCardDialogComponent {
  public event: Event;
  public user: UserDetails;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.event = data.event;
    this.user = data.user;
  }
}
