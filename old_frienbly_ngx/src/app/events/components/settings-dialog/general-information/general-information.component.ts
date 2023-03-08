import {Injectable, Component, Input, Output, OnInit, EventEmitter, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators, FormBuilder} from '@angular/forms';

import {Event} from '../../../../common/contracts/event/event';

import {FileHolder} from '../../../../common/components/image-uploader/image-upload/image-upload.component';

@Component({
  selector: 'events-settings-general-information',
  templateUrl: './general-information.component.html',
  styleUrls: ['./general-information.component.scss']
})
@Injectable()
export class GeneralInformationComponent implements OnInit {
  public loading: boolean = false;

  public isValid: boolean = true;

  @ViewChild('eventDetails')
  public eventDetailsForm;

  @ViewChild('eventLocation')
  public eventLocationForm;

  lastEventImage: { imageId: string, rotation: number };
  _event: Event;
  @Input()
  set event(event: Event) {
    if (event && event.imageId) {
      this.lastEventImage = { imageId: event.imageId, rotation: event.imageRotation };
    }
    this._event = event;
  }

  @Output() private validityStateChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output() private imageChanged = new EventEmitter<FileHolder>();
  @Output() private imageRemoved = new EventEmitter<FileHolder>();

  ngOnInit() {
    this.updateValidity();

    this.eventDetailsForm.valueChanges.subscribe(val => {
      this.updateValidity();
    });
    this.eventLocationForm.valueChanges.subscribe(val => {
      this.updateValidity();
    });
  }

  updateValidity() {
    var currentValidityState = this.eventDetailsForm.valid && this.eventLocationForm.valid;

    if (this.isValid != currentValidityState) {
      this.isValid = currentValidityState;
      this.validityStateChanged.emit(this.isValid);
    }
  }

  toggleOnlineOnly() {
    this._event.onlineOnly = !this._event.onlineOnly;

    setTimeout(() => {
      this.updateValidity();
    }, 100);
  }
}
