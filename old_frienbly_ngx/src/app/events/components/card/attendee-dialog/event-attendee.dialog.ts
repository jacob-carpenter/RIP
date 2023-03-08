import {Injectable, Component, Input, Output, OnInit, EventEmitter, ViewChild, OnDestroy, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

import {EventRsvpStatusType} from '../../../../common/contracts/event/event-rsvp-status.type';

import { UserDetailsService } from '../../../../user/services/user-details.service';
import { ImageService } from '../../../../common/services/image.service';

import { UserDetails } from '../../../../common/contracts/user/models/user-details';

import {environment} from '../../../../../environments/environment';

@Component({
  selector: 'event-attendee-dialog',
  templateUrl: './event-attendee.dialog.html',
  styleUrls: ['./event-attendee.dialog.scss']
})
@Injectable()
export class EventAttendeeDialog implements OnInit {
  public EventRsvpStatusType = EventRsvpStatusType;

  public loading: boolean;

  public users: UserDetails[];

  public userIds: Array<number> = [];

  public rsvpType: EventRsvpStatusType;

  constructor(
    public dialogRef: MatDialogRef<EventAttendeeDialog>,
    private dialog: MatDialog,
    private userDetailsService: UserDetailsService,
    private imageService: ImageService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.userIds = data.userIds;
    this.rsvpType = data.rsvpType;
  }

  public ngOnInit() {
    this.loading = true;

    this.userDetailsService.getMultiple(this.userIds).subscribe((users) => {
      this.users = users;

      var imageIds = [];
      for (var index = 0; index < users.length; index++) {
        if (users[index] && users[index].imageId) {
          imageIds.push(users[index].imageId);
        }
      }

      this.imageService.getMultiple(imageIds).subscribe(() => {
        this.loading = false;
      });
    });
  }
}
