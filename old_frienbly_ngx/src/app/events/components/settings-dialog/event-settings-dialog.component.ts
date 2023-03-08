import {Injectable, Component, Input, Output, OnInit, EventEmitter, ViewChild, OnDestroy, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Observable} from 'rxjs/Observable';
import {AsyncSubject} from 'rxjs/AsyncSubject';

import {RoutingService} from '../../../common/services/routing.service';
import {RouteProvider} from '../../../routes/route.provider';

import {Event} from '../../../common/contracts/event/event';
import {StreetLocation} from '../../../common/contracts/geolocation/street-location';
import {UserDetails} from '../../../common/contracts/user/models/user-details';
import {Chat} from '../../../common/contracts/chat/chat';

import {UserDetailsService} from '../../../user/services/user-details.service';
import {ImageService} from '../../../common/services/image.service';
import {FileHolder} from '../../../common/components/image-uploader/image-upload/image-upload.component';
import {EventSettingsService} from '../../../common/services/events/event-settings.service';
import {GeolocationService} from '../../../common/services/geolocation.service';

import {ConfirmationDialogComponent} from '../../../common/components/dialogs/confirmation/confirmation-dialog.component';

import {environment} from '../../../../environments/environment';

@Component({
  selector: 'event-settings-dialog',
  templateUrl: './event-settings-dialog.component.html',
  styleUrls: ['./event-settings-dialog.component.scss']
})
@Injectable()
export class EventSettingsDialogComponent implements OnInit {
  saved: boolean = false;
  isErrored: boolean = false;
  loading: boolean = false;

  updatedEvent: Event = null;
  removedImageId: string;
  updatedImage: FileHolder = null;

  generalInformationValid: boolean = true;

  user: UserDetails;
  chat: Chat;

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private geolocationService: GeolocationService,
    private imageService: ImageService,
    private routingService: RoutingService,
    private userDetailsService: UserDetailsService,
    private eventService: EventSettingsService
  ) {
    if (data) {
      this.user = data.user;
      this.chat = data.chat;
    }
  }

  public ngOnInit() {
    if (!this.eventService.getSelectedEvent()) {
      this.loading = true;
      this.userDetailsService.get().subscribe(
        (response) => {
          var event = new Event();

          event.sentByUserId = this.user.id;
          event.targettedChatId = this.chat.chatId;
          event.onlineOnly = response.onlineOnly;
          event.latitude = response.latitude;
          event.longitude = response.longitude;
          event.city = response.city;
          event.postalCode = response.postalCode;
          event.province = response.province;
          event.country = response.country;

          this.finishEventLoad(event);

          this.loading = false;
        },
        (error) => {
          this.finishEventLoad(new Event());

          this.loading = false;
        }
      );
    } else {
      this.loading = true;

      this.eventService.getById(this.eventService.getSelectedEvent().eventId).subscribe(
        (event) => {
          this.finishEventLoad(event);
          this.loading = false;
        },
        (error) => {
          console.log(error);

          this.loading = false;
        }
      );
    }
  }

  public handleSave() {
    this.loading = true;
    if (!this.eventService.getSelectedEvent()) {
      var event = new Event();
      event.eventName = this.updatedEvent.eventName;

      this.eventService.save(this.updatedEvent).subscribe(
        (createdEvent) => {
          this.updatedEvent.eventId = createdEvent.eventId;
          this.updatedEvent.eventName = createdEvent.eventName;

          this.eventService.setSelectedEvent(createdEvent);

          this.saveEvent();
        },
        (error) => {
          console.log(error);

          this.loading = false;
        }
      );
    } else {
      this.saveEvent();
    }
  }
  public saveEvent() {
    this.eventService.getById(this.updatedEvent.eventId).subscribe(
      (currentEventDetails) => {
        if (JSON.stringify(currentEventDetails) != JSON.stringify(this.updatedEvent)) {
          if (this.areLocationSettingsDifferent(currentEventDetails, this.updatedEvent)) {
            this.populateLatLong(this.updatedEvent).subscribe(
              (updatedDetails) => {
                this.saveImageRemovalUpdateAndDetails(currentEventDetails);
              },
              (error) => {
                this.saveImageRemovalUpdateAndDetails(currentEventDetails);
              }
            )
          } else {
            this.saveImageRemovalUpdateAndDetails(currentEventDetails);
          }
        } else {
          this.loading = false;
          this.finishSave();
        }
      },
      (error) => {
        console.log(error);

        this.loading = false;
      }
    );
  }
  private saveImageRemovalUpdateAndDetails(currentEventDetails: Event) {
    if (this.removedImageId) {
      this.imageService.delete(this.removedImageId).subscribe(
        (response) => {
          this.saveImageUpdateAndDetails(currentEventDetails);
        },
        (error) => {
          this.saveImageUpdateAndDetails(currentEventDetails);
        }
      );
    } else {
      this.saveImageUpdateAndDetails(currentEventDetails);
    }
    this.removedImageId = null;
  }
  private saveImageUpdateAndDetails(currentEventDetails: Event) {
    if (this.updatedImage && this.updatedImage.newFile) {
      this.imageService.upload(this.updatedImage.imageId, this.updatedImage.file).subscribe(
        (response) => {
          this.saveDetails();
        },
        (error) => {
          this.saveDetails();
        }
      );
    } else {
      this.saveDetails();
    }
    this.updatedImage = null;
  }
  private saveDetails() {
    this.eventService.save(this.updatedEvent).subscribe(
      (event) => {
        this.finishEventLoad(event);
        this.loading = false;

        this.finishSave();
      },
      (error) => {
        console.log(error);

        this.loading = false;

        this.finishSave();
      }
    );
  }
  private finishSave() {
    this.dialogRef.close();
  }

  private areLocationSettingsDifferent(currentEvent: Event, updatedEvent: Event) {
    return currentEvent.street != updatedEvent.street ||
      currentEvent.city != updatedEvent.city ||
      currentEvent.province != updatedEvent.province ||
      currentEvent.postalCode != updatedEvent.postalCode ||
      currentEvent.country != updatedEvent.country ||
      (!updatedEvent.onlineOnly && (updatedEvent.latitude == 0 || updatedEvent.longitude == 0));
  }
  private populateLatLong(event: Event) : Observable<Event> {
    var requestSubject = new AsyncSubject<Event>();
    var streetLocation = new StreetLocation();

    streetLocation.street = event.street;
    streetLocation.city = event.city;
    streetLocation.province = event.province;
    streetLocation.postalCode = event.postalCode;
    streetLocation.country = event.country;

    this.geolocationService.getGeolocationDetails(streetLocation).subscribe(
      (response) => {
        event.latitude = response.latitude;
        event.longitude = response.longitude;

        event.street = streetLocation.street;
        event.city = streetLocation.city;
        event.province = streetLocation.province;
        event.postalCode = streetLocation.postalCode;
        event.country = streetLocation.country;
      }
    );

    return requestSubject;
  }

  private finishEventLoad(loadedEvent: Event) {
    var event = JSON.parse(JSON.stringify(loadedEvent));
    
    if (event.eventDateTime) {
      event.eventDateTime = new Date(event.eventDateTime);
    }

    this.updatedEvent = event;
  }


  public handleEventChange(event: Event) {
    this.updatedEvent.onlineOnly = event.onlineOnly;
  }

  public generalInformationValidStateChanged(valid: boolean) {
    this.generalInformationValid = valid;
  }

  public imageRemoved(image: FileHolder) {
    if (!this.removedImageId && this.updatedEvent.imageId) {
      this.removedImageId = this.updatedEvent.imageId;
      this.updatedEvent.imageId = null;
    }
  }

  public imageChanged(image: FileHolder) {
    this.updatedImage = image;

    this.updatedEvent.imageId = image.imageId;
    this.updatedEvent.imageRotation = image.rotation;
  }

  public getSaveButtonText() {
    return this.updatedEvent && this.updatedEvent.eventId > 0 ? 'Update Event' : 'Create Event';
  }
}
