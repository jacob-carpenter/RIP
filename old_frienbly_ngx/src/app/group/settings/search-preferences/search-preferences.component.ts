import {Injectable, Component, Input, Output, OnInit, EventEmitter, ViewChild} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {Observable} from 'rxjs/Observable';

import {GroupTag} from '../../../common/contracts/group/models/group-tag';
import {Tag, ViewableTag} from '../../../common/contracts/tags/tag';
import {TagType} from '../../../common/contracts/tags/tag.type';
import {TagCount} from '../../../common/contracts/tags/tag.count';
import {TagService} from '../../../common/services/tags/tag.service';

import {GroupDetails} from '../../../common/contracts/group/models/group-details';

@Component({
  selector: 'settings-search-preferences',
  templateUrl: './search-preferences.component.html',
  styleUrls: ['./search-preferences.component.scss']
})
@Injectable()
export class SearchPreferencesComponent implements OnInit {
  TagType = TagType;

  loading: boolean = false;
  isValid: boolean = true;

  inputIndividualSearchTags: ViewableTag[];
  inputGroupSearchTags: ViewableTag[];

  @ViewChild('individualPreferencesForm')
  individualPreferencesForm;

  @ViewChild('groupPreferencesForm')
  groupPreferencesForm;

  @Output()
  private validityStateChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  _groupDetails: GroupDetails;
  @Input()
  set groupDetails(groupDetails: GroupDetails) {
    this.inputIndividualSearchTags = this.tagService.populateGroupTagsFromDetails(TagType.USER_SEARCH, groupDetails);
    this.inputGroupSearchTags = this.tagService.populateGroupTagsFromDetails(TagType.GROUP_SEARCH, groupDetails);

    this._groupDetails = groupDetails;
  }


  constructor(private tagService: TagService) { }

  ngOnInit() {
    this.updateValidity();

    this.individualPreferencesForm.valueChanges.subscribe(val => {
      this.updateValidity();
    });
    this.groupPreferencesForm.valueChanges.subscribe(val => {
      this.updateValidity();
    });
  }

  updateValidity() {
    var currentValidityState = this.individualPreferencesForm.valid && this.groupPreferencesForm.valid;

    if (this.isValid != currentValidityState) {
      this.isValid = currentValidityState;
      this.validityStateChanged.emit(this.isValid);
    }
  }

  public toggleLookingForIndividuals() {
    this._groupDetails.lookingForIndividuals = !this._groupDetails.lookingForIndividuals;

    setTimeout(() => {
      this.updateValidity();
    }, 100);
  }

  public toggleLookingForGroups() {
    this._groupDetails.lookingForGroups = !this._groupDetails.lookingForGroups;

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
      case TagType.USER_SEARCH:
        this.inputIndividualSearchTags = this.tagService.populateGroupTagsFromDetails(TagType.USER_SEARCH, this._groupDetails);
        break;
      case TagType.GROUP_SEARCH:
        this.inputGroupSearchTags = this.tagService.populateGroupTagsFromDetails(TagType.GROUP_SEARCH, this._groupDetails);
        break;
    }
  }

}
