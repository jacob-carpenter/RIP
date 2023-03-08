import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {AsyncSubject} from 'rxjs/AsyncSubject';

import {ViewableTag} from '../../../../common/contracts/tags/tag';

import {GroupService} from '../../../../common/services/groups/group.service';
import {GroupDetailsService} from '../../../../group/services/group-details.service';
import {UserDetailsService} from '../../../../user/services/user-details.service';
import {FilterCriteria} from '../../../../common/contracts/search/filter/filter-criteria';

@Injectable()
export class FilterSettingsService {
  private lastRunCriteria: FilterCriteria;
  private lastFilteredEntity: any;

  constructor(
    private userDetailsService: UserDetailsService,
    private groupDetailsService: GroupDetailsService,
    private groupService: GroupService
  ) { }

  public getFilterCriteria() : Observable<FilterCriteria> {
    var requestSubject = new AsyncSubject<FilterCriteria>();

    if (this.groupService.getSelectedGroup() != null) {
      this.groupDetailsService.get(this.groupService.getSelectedGroup().id).subscribe(
        (groupDetails) => {
          if (this.lastRunCriteria != null && this.lastFilteredEntity == groupDetails) {
            requestSubject.next(JSON.parse(JSON.stringify(this.lastRunCriteria)));
            requestSubject.complete();
            return;
          }
          this.lastFilteredEntity = groupDetails;

          this.lastRunCriteria = new FilterCriteria();
          this.lastRunCriteria.executedByGroupId = groupDetails.id;
          this.lastRunCriteria.searchForUsers = true;
          this.lastRunCriteria.searchForGroups = true;
          this.lastRunCriteria.useAgeRange = groupDetails.useAge;
          if (this.lastRunCriteria.useAgeRange) {
            this.setAgeRange(this.lastRunCriteria, groupDetails.suggestedAge);
          }
          this.lastRunCriteria.filteredByGender = false;
          this.lastRunCriteria.tags = [];
          this.lastRunCriteria.modelTags = [];

          this.lastRunCriteria.onlineOnly = groupDetails.onlineOnly;
          if (groupDetails.latitude != 0 && groupDetails.longitude != 0) {
            this.lastRunCriteria.canUseMyLocation = true;
            this.lastRunCriteria.useMyLocation = true;
          }

          var tagDisplays = new Array<string>();
          for (var index = 0; index < groupDetails.groupTags.length; index++) {
            var tag = groupDetails.groupTags[index].tag;
            this.lastRunCriteria.modelTags.push(groupDetails.groupTags[index]);
          }

          this.lastRunCriteria.searchRadiusInMiles = 100;
          this.lastRunCriteria.latitude = groupDetails.latitude;
          this.lastRunCriteria.longitude = groupDetails.longitude;
          this.lastRunCriteria.street = groupDetails.street;
          this.lastRunCriteria.city = groupDetails.city;
          this.lastRunCriteria.province = groupDetails.province;
          this.lastRunCriteria.postalCode = groupDetails.postalCode;
          this.lastRunCriteria.country = groupDetails.country;

          requestSubject.next(JSON.parse(JSON.stringify(this.lastRunCriteria)));
          requestSubject.complete();
        },
        (error) => {
          console.log(error);

          requestSubject.next(new FilterCriteria());
          requestSubject.complete();
        }
      );
    } else {
      this.userDetailsService.get().subscribe(
        (userDetails) => {
          if (this.lastRunCriteria != null && this.lastFilteredEntity == userDetails) {
            requestSubject.next(JSON.parse(JSON.stringify(this.lastRunCriteria)));
            requestSubject.complete();
            return;
          }
          this.lastFilteredEntity = userDetails;

          this.lastRunCriteria = new FilterCriteria();
          this.lastRunCriteria.executedByUserId = userDetails.id;
          this.lastRunCriteria.searchForUsers = true;
          this.lastRunCriteria.searchForGroups = true;
          this.lastRunCriteria.useAgeRange = true;
          this.setAgeRange(this.lastRunCriteria, this.getAge(new Date(userDetails.birthdate)));
          this.lastRunCriteria.filteredByGender = false;
          this.lastRunCriteria.tags = [];
          this.lastRunCriteria.modelTags = [];

          this.lastRunCriteria.onlineOnly = userDetails.onlineOnly;
          if (userDetails.latitude != 0 && userDetails.longitude != 0) {
            this.lastRunCriteria.canUseMyLocation = true;
            this.lastRunCriteria.useMyLocation = true;
          }

          var tagDisplays = new Array<string>();
          for (var index = 0; index < userDetails.userTags.length; index++) {
            var tag = userDetails.userTags[index].tag;
            this.lastRunCriteria.modelTags.push(userDetails.userTags[index]);
          }

          this.lastRunCriteria.searchRadiusInMiles = 100;
          this.lastRunCriteria.latitude = userDetails.latitude;
          this.lastRunCriteria.longitude = userDetails.longitude;
          this.lastRunCriteria.street = userDetails.street;
          this.lastRunCriteria.city = userDetails.city;
          this.lastRunCriteria.province = userDetails.province;
          this.lastRunCriteria.postalCode = userDetails.postalCode;
          this.lastRunCriteria.country = userDetails.country;

          requestSubject.next(JSON.parse(JSON.stringify(this.lastRunCriteria)));
          requestSubject.complete();
        },
        (error) => {
          console.log(error);

          requestSubject.next(new FilterCriteria());
          requestSubject.complete();
        }
      );
    }

    return requestSubject;
  }

  private getAge(birthday: Date) {
    var ageDifMs = Date.now() - birthday.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  private setAgeRange(filterCriteria: FilterCriteria, age: number) {
    filterCriteria.startAge = age - 6 < 17 ? 17 : age - 6;
    filterCriteria.endAge = age + 5;
  }

  public setFilterCriteria(filterCriteria: FilterCriteria) {
    this.lastRunCriteria = JSON.parse(JSON.stringify(filterCriteria));
  }
}
