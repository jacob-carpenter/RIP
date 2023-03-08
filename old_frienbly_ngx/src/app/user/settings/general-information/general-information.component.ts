import {Injectable, Component, Input, Output, OnInit, EventEmitter, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators, FormBuilder} from '@angular/forms';
import {Observable} from 'rxjs/Observable';

import {UserDetails} from '../../../common/contracts/user/models/user-details';
import {SexTypeMap, SexType} from '../../../common/contracts/user/models/sex.type';
import {Tag, ViewableTag} from '../../../common/contracts/tags/tag';
import {TagType} from '../../../common/contracts/tags/tag.type';
import {TagCount} from '../../../common/contracts/tags/tag.count';
import {TagService} from '../../../common/services/tags/tag.service';

import {UserDetailsService} from '../../services/user-details.service';

import {FileHolder} from '../../../common/components/image-uploader/image-upload/image-upload.component';

@Component({
  selector: 'settings-general-information',
  templateUrl: './general-information.component.html',
  styleUrls: ['./general-information.component.scss']
})
@Injectable()
export class GeneralInformationComponent implements OnInit {
  TagType = TagType;

  public sexTypes = SexTypeMap.sexTypes;

  public loading: boolean = false;

  public isValid: boolean = true;

  public inputPersonalTags: ViewableTag[];
  public inputInterestedInTags: ViewableTag[];

  @ViewChild('accountLocationForm')
  public locationForm;

  @ViewChild('accountSharedInformation')
  public sharedInformationForm;

  @ViewChild('personalForm')
  public personalForm;

  @ViewChild('interestedInForm')
  public interestedInForm;

  lastProfileImage: { imageId: string, rotation: number };
  _userDetails: UserDetails;
  @Input()
  set userDetails(userDetails: UserDetails) {
    this.inputPersonalTags = this.tagService.populateUserTagsFromDetails(TagType.PERSONAL, userDetails);
    this.inputInterestedInTags = this.tagService.populateUserTagsFromDetails(TagType.INTERESTS, userDetails);

    if (userDetails && userDetails.imageId) {
      this.lastProfileImage = { imageId: userDetails.imageId, rotation: userDetails.imageRotation };
    }
    this._userDetails = userDetails;
  }

  @Output() private validityStateChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output() private imageChanged = new EventEmitter<FileHolder>();
  @Output() private imageRemoved = new EventEmitter<FileHolder>();

  constructor(private userDetailsService: UserDetailsService, private tagService: TagService) {}

  ngOnInit() {
    this.updateValidity();

    this.personalForm.valueChanges.subscribe(val => {
      this.updateValidity();
    });
    this.interestedInForm.valueChanges.subscribe(val => {
      this.updateValidity();
    });
    this.locationForm.valueChanges.subscribe(val => {
      this.updateValidity();
    });
    this.sharedInformationForm.valueChanges.subscribe(val => {
      this.updateValidity();
    });
  }

  updateValidity() {
    var currentValidityState = this.locationForm.valid && this.sharedInformationForm.valid && this.personalForm.valid && this.interestedInForm.valid;

    if (this.isValid != currentValidityState) {
      this.isValid = currentValidityState;
      this.validityStateChanged.emit(this.isValid);
    }
  }

  toggleOnlineOnly() {
    this._userDetails.onlineOnly = !this._userDetails.onlineOnly;

    setTimeout(() => {
      this.updateValidity();
    }, 100);
  }

  private updateViewableTags(tagType: TagType)  {
    switch (tagType) {
      case TagType.PERSONAL:
        this.inputPersonalTags = this.tagService.populateUserTagsFromDetails(TagType.PERSONAL, this._userDetails);
        break;
      case TagType.INTERESTS:
        this.inputInterestedInTags = this.tagService.populateUserTagsFromDetails(TagType.INTERESTS, this._userDetails);
        break;
    }
  }

  public getCommonTagItems = (search: string): Observable<ViewableTag[]>  => {
    return this.tagService.getTopUsed(search).map((response: TagCount[]) => {
      var autocompleteModels: ViewableTag[] = new Array<ViewableTag>();

      for (var index in response) {
        var tagCount = response[index];

        autocompleteModels.push(new ViewableTag(tagCount.tag.display, tagCount.tag.display));
      }

      return autocompleteModels;
    });
  }

  private cleanTagText(display: string) : string {
    return this.tagService.cleanTagText(display);
  }

  public addTag(tagType: TagType, event: ViewableTag) {
    this.tagService.addTag(tagType, event, this._userDetails);
  }

  public removeTag(tagType: TagType, event: ViewableTag) {
    this.tagService.removeTag(tagType, event, this._userDetails);
  }

  public addTags(affectedTagType: TagType, copyFromTagType: TagType, userDetails: UserDetails) {
    this.tagService.addTags(affectedTagType, copyFromTagType, this._userDetails);

    this.updateViewableTags(affectedTagType);
  }

  public clearTags(tagType: TagType) {
    this.tagService.clearTags(tagType, this._userDetails);

    this.updateViewableTags(tagType);
  }
}
