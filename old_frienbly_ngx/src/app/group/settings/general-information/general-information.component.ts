import {Injectable, Component, Input, Output, OnInit, EventEmitter, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators, FormBuilder} from '@angular/forms';
import {Observable} from 'rxjs/Observable';

import {UserDetails} from '../../../common/contracts/user/models/user-details';
import {GroupDetails} from '../../../common/contracts/group/models/group-details';

import {GroupTag} from '../../../common/contracts/group/models/group-tag';
import {Tag, ViewableTag} from '../../../common/contracts/tags/tag';
import {TagType} from '../../../common/contracts/tags/tag.type';
import {TagCount} from '../../../common/contracts/tags/tag.count';
import {TagService} from '../../../common/services/tags/tag.service';

import {GroupDetailsService} from '../../services/group-details.service';

import {FileHolder} from '../../../common/components/image-uploader/image-upload/image-upload.component';

@Component({
  selector: 'settings-general-information',
  templateUrl: './general-information.component.html',
  styleUrls: ['./general-information.component.scss']
})
@Injectable()
export class GeneralInformationComponent implements OnInit {
  TagType = TagType;

  loading: boolean = false;

  isValid: boolean = true;

  inputInterestedInTags: ViewableTag[];

  @ViewChild('interestedInForm')
  interestedInForm;

  @ViewChild('accountLocationForm')
  locationForm;

  @ViewChild('accountSharedInformation')
  sharedInformationForm;

  lastGroupImage: { imageId: string, rotation: number };
  _groupDetails: GroupDetails;
  @Input()
  set groupDetails(groupDetails: GroupDetails) {
    this.inputInterestedInTags = this.tagService.populateGroupTagsFromDetails(TagType.INTERESTS, groupDetails);

    if (groupDetails && groupDetails.imageId) {
      this.lastGroupImage = { imageId: groupDetails.imageId, rotation: groupDetails.imageRotation };
    }
    this._groupDetails = groupDetails;
  }

  @Output() private validityStateChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output() private imageChanged = new EventEmitter<FileHolder>();
  @Output() private imageRemoved = new EventEmitter<FileHolder>();

  constructor(private groupDetailsService: GroupDetailsService, private tagService: TagService) {}

  ngOnInit() {
    this.updateValidity();

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
    var currentValidityState = this.interestedInForm.valid && this.locationForm.valid && this.sharedInformationForm.valid;

    if (this.isValid != currentValidityState) {
      this.isValid = currentValidityState;
      this.validityStateChanged.emit(this.isValid);
    }
  }

  toggleOnlineOnly() {
    this._groupDetails.onlineOnly = !this._groupDetails.onlineOnly;

    setTimeout(() => {
      this.updateValidity();
    }, 100);
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

  public addTag(tagType: TagType, event: ViewableTag) {
    this.tagService.addGroupTag(tagType, event, this._groupDetails);
  }

  public removeTag(tagType: TagType, event: ViewableTag) {
    this.tagService.removeGroupTag(tagType, event, this._groupDetails);
  }

  public addTags(affectedTagType: TagType, copyFromTagType: TagType) {
    this.tagService.addGroupTags(affectedTagType, copyFromTagType, this._groupDetails);

    this.updateViewableTags(affectedTagType);
  }

  public clearTags(tagType: TagType) {
    this.tagService.clearGroupTags(tagType, this._groupDetails);

    this.updateViewableTags(tagType);
  }

  private updateViewableTags(tagType: TagType) {
    switch (tagType) {
      case TagType.INTERESTS:
        this.inputInterestedInTags = this.tagService.populateGroupTagsFromDetails(TagType.INTERESTS, this._groupDetails);
        break;
    }
  }
}
