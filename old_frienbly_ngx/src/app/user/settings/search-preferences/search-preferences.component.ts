import {Injectable, Component, Input, Output, OnInit, EventEmitter, ViewChild} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {Observable} from 'rxjs/Observable';

import {UserTag} from '../../../common/contracts/user/models/user-tag';
import {Tag, ViewableTag} from '../../../common/contracts/tags/tag';
import {TagType} from '../../../common/contracts/tags/tag.type';
import {TagCount} from '../../../common/contracts/tags/tag.count';
import {TagService} from '../../../common/services/tags/tag.service';

import {UserDetails} from '../../../common/contracts/user/models/user-details';

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

  _userDetails: UserDetails;
  @Input()
  set userDetails(userDetails: UserDetails) {
    this.inputIndividualSearchTags = this.tagService.populateUserTagsFromDetails(TagType.USER_SEARCH, userDetails);
    this.inputGroupSearchTags = this.tagService.populateUserTagsFromDetails(TagType.GROUP_SEARCH, userDetails);

    this._userDetails = userDetails;
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
    this._userDetails.lookingForIndividuals = !this._userDetails.lookingForIndividuals;

    setTimeout(() => {
      this.updateValidity();
    }, 100);
  }

  public toggleLookingForGroups() {
    this._userDetails.lookingForGroups = !this._userDetails.lookingForGroups;

    setTimeout(() => {
      this.updateValidity();
    }, 100);
  }

  private updateViewableTags(tagType: TagType) {
    switch (tagType) {
      case TagType.USER_SEARCH:
        this.inputIndividualSearchTags = this.tagService.populateUserTagsFromDetails(TagType.USER_SEARCH, this._userDetails);
        break;
      case TagType.GROUP_SEARCH:
        this.inputGroupSearchTags = this.tagService.populateUserTagsFromDetails(TagType.GROUP_SEARCH, this._userDetails);
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
