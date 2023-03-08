import {Injectable, Component, OnInit, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

import {Observable} from 'rxjs/Observable';

import {GroupDetails} from '../../../common/contracts/group/models/group-details';
import {UserDetails} from '../../../common/contracts/user/models/user-details';
import {StreetLocation} from '../../../common/contracts/geolocation/street-location';

import {GroupService} from '../../../common/services/groups/group.service';
import {GroupDetailsService} from '../../../group/services/group-details.service';
import {UserDetailsService} from '../../../user/services/user-details.service';
import {GeolocationService} from '../../../common/services/geolocation.service';

import {FilterSettingsService} from './services/filter-settings.service';
import {FilterCriteria} from '../../../common/contracts/search/filter/filter-criteria';

import {SexTypeMap, SexType} from '../../../common/contracts/user/models/sex.type';

import {Tag, ViewableTag} from '../../../common/contracts/tags/tag';
import {TagType} from '../../../common/contracts/tags/tag.type';
import {TagCount} from '../../../common/contracts/tags/tag.count';
import {TagService} from '../../../common/services/tags/tag.service';

declare let gtag: Function;

@Component({
  selector: 'search-filter',
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.scss']
})
@Injectable()
export class SearchFilterComponent implements OnInit {
  public TagType = TagType;
  public filterCriteria: FilterCriteria;
  public sexTypes = SexTypeMap.sexTypes;

  public loading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<SearchFilterComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private tagService: TagService,
    public filterSettingsService: FilterSettingsService,
    private geolocationService: GeolocationService,
    private userDetailsService: UserDetailsService,
    private groupDetailsService: GroupDetailsService,
    private groupService: GroupService
  ) {}

  public ngOnInit() {
    this.loading = true;
    this.filterSettingsService.getFilterCriteria().subscribe(
      (filterCriteria) => {
        this.filterCriteria = filterCriteria;
        this.loading = false;
      },
      (error) => {
        console.log(error);

        this.loading = false;
      }
    );
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

  public toggleSearchForUsers() {
    this.filterCriteria.searchForUsers = !this.filterCriteria.searchForUsers;

    if (!this.filterCriteria.searchForUsers) {
      this.filterCriteria.searchForGroups = true;
    }
  }

  public toggleSearchForGroups() {
    this.filterCriteria.searchForGroups = !this.filterCriteria.searchForGroups;

    if (!this.filterCriteria.searchForGroups) {
      this.filterCriteria.searchForUsers = true;
    }
  }

  private cleanTagText(display: string) : string {
    return display.toLowerCase().trim();
  }

  public addTag(tag: ViewableTag) {
    if (this.filterCriteria.tags.indexOf(tag) >= 0) {
      return;
    }

    this.filterCriteria.tags.push(tag);
  }

  public removeTag(tag: ViewableTag) {
    var index = this.filterCriteria.tags.indexOf(tag);
    if (index >= 0) {
      this.filterCriteria.tags.splice(index, 1);
    }
  }

  public isFilterValid() : boolean {
    if (!this.filterCriteria ||
      (!this.filterCriteria.onlineOnly && this.filterCriteria.searchRadiusInMiles <= 0) ||
      (this.filterCriteria.useAgeRange && this.filterCriteria.startAge > this.filterCriteria.endAge)) {
      return false;
    }

    return true;
  }

  public updateLocation() {
    this.filterCriteria.latitude = 0;
    this.filterCriteria.longitude = 0;
  }

  public useTagsForType(tagType: TagType) {
    this.filterCriteria.tags = [];

    var tagDisplays = new Array<string>();
    for (var index = 0; index < this.filterCriteria.modelTags.length; index++) {
      var tagContainer = this.filterCriteria.modelTags[index];
      var tag = tagContainer.tag;

      if (tag && tagContainer.tagType == tagType && tag.display && tagDisplays.indexOf(tag.display) < 0) {
        tagDisplays.push(tag.display);
        this.filterCriteria.tags.push(new ViewableTag(tag.display, tag.display));
      }
    }
  }

  public useAllTags() {
    this.filterCriteria.tags = [];

    var tagDisplays = new Array<string>();
    for (var index = 0; index < this.filterCriteria.modelTags.length; index++) {
      var tagContainer = this.filterCriteria.modelTags[index];
      var tag = tagContainer.tag;

      if (tag && tag.display && tagDisplays.indexOf(tag.display) < 0) {
        tagDisplays.push(tag.display);
        this.filterCriteria.tags.push(new ViewableTag(tag.display, tag.display));
      }
    }
  }

  public clearTags() {
    this.filterCriteria.tags = [];
  }

  public runFilter() {
    gtag('event', 'search-filter-application', {
      'event_category': 'search'
    });

    this.filterCriteria.currentPage = 0;

    if (!this.filterCriteria.onlineOnly) {
      if (this.filterCriteria.useMyLocation) {
        if (this.groupService.getSelectedGroup() != null) {
          this.groupDetailsService.get(this.groupService.getSelectedGroup().id).subscribe(
            (result : GroupDetails) => {
              this.filterCriteria.latitude = result.latitude;
              this.filterCriteria.longitude = result.longitude;

              this.notifyFilterExecution();
            },
            (error) => {
              // TODO Handle Error
            }
          );
        } else {
          this.userDetailsService.get().subscribe(
            (result : UserDetails) => {
              this.filterCriteria.latitude = result.latitude;
              this.filterCriteria.longitude = result.longitude;

              this.notifyFilterExecution();
            },
            (error) => {
              // TODO Handle Error
            }
          );
        }
      } else if (!this.filterCriteria.latitude || !this.filterCriteria.longitude || (this.filterCriteria.latitude == 0 && this.filterCriteria.longitude == 0)) {
        var streetLocation = new StreetLocation();
        streetLocation.street = this.filterCriteria.street;
        streetLocation.city = this.filterCriteria.city;
        streetLocation.province = this.filterCriteria.province;
        streetLocation.postalCode = this.filterCriteria.postalCode;
        streetLocation.country = this.filterCriteria.country;
        this.geolocationService.getGeolocationDetails(streetLocation).subscribe(
          (result : StreetLocation) => {
            this.filterCriteria.latitude = result.latitude;
            this.filterCriteria.longitude = result.longitude;

            this.notifyFilterExecution();
          },
          (error) => {
            // TODO Handle Error
          }
        );
      } else {
        this.notifyFilterExecution();
      }
    } else {
      this.notifyFilterExecution();
    }
  }
  private notifyFilterExecution() {
    this.filterSettingsService.setFilterCriteria(this.filterCriteria);
    this.dialogRef.close(this.filterCriteria);
  }
}
