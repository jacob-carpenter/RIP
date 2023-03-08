import {Injectable, Component, OnInit, OnDestroy} from '@angular/core';
import {MatDialog} from '@angular/material';
import {Router, NavigationEnd} from '@angular/router';

import {Observable} from 'rxjs/Observable';

import {FilterCriteria} from '../../common/contracts/search/filter/filter-criteria';
import {SearchResult} from '../../common/contracts/search/search-result';
import {SearchFilterComponent} from './filter/search-filter.component';
import {FilterSettingsService} from './filter/services/filter-settings.service';

import {UserDetails} from '../../common/contracts/user/models/user-details';
import {Group} from '../../common/contracts/group/models/group';
import {GroupDetails} from '../../common/contracts/group/models/group-details';
import {GroupChangeListener} from '../../common/services/groups/group-change.listener';
import {GroupService} from '../../common/services/groups/group.service';
import {UserDetailsService} from '../../user/services/user-details.service';
import {GroupDetailsService} from '../../group/services/group-details.service';

import {environment} from '../../../environments/environment';

import {ImageService} from '../../common/services/image.service';
import {SearchService} from './services/search.service';

declare let gtag: Function;

@Component({
  selector: 'search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss']
})
@Injectable()
export class SearchPageComponent implements OnInit, GroupChangeListener, OnDestroy {
  public loading: boolean = false;

  public currentFilterCriteria: FilterCriteria;
  public reportResults: SearchResult[] = new Array<SearchResult>();

  public currentUser: UserDetails;
  public displayUserSettingsNotificationBar: boolean;
  public currentGroup: GroupDetails;
  public displayGroupSettingsNotificationBar: boolean;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private filterSettingsService: FilterSettingsService,
    private searchService: SearchService,
    private imageService: ImageService,
    private groupService: GroupService,
    private userDetailsService: UserDetailsService,
    private groupDetailsService: GroupDetailsService
  ) {}

  public ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd ) {
        window.scrollTo(0, 0);
      }
    });

    if (this.groupService.getSelectedGroup()) {

      this.groupDetailsService.getById(this.groupService.getSelectedGroup().id).subscribe((group) => {
        this.displayGroupSettingsNotificationBar = !this.groupDetailsService.areRequiredSettingsEntered(group);
        this.currentGroup = group;
      });
    } else {
      this.userDetailsService.get().subscribe((user) => {
        this.displayUserSettingsNotificationBar = !this.userDetailsService.areRequiredSettingsEntered(user);
        this.currentUser = user;
      });
    }

    this.runInitialReport();

    this.groupService.registerGroupChangeListener(this);
  }

  public ngOnDestroy() {
    this.groupService.unregisterGroupChangeListener(this);
  }

  public handleGroupChange(group: Group) {
    if (this.groupService.getSelectedGroup()) {
      this.groupDetailsService.getById(this.groupService.getSelectedGroup().id).subscribe((group) => {
        this.displayGroupSettingsNotificationBar = !this.groupDetailsService.areRequiredSettingsEntered(group);
        this.currentGroup = group;
      });
    }

    this.runInitialReport();
  }

  public runInitialReport() {
    this.reportResults = new Array<SearchResult>();

    if (!this.loading) {
      this.loading = true;
      this.filterSettingsService.getFilterCriteria().subscribe(
        (filterCriteria) => {
          this.currentFilterCriteria = filterCriteria;

          this.runReport(true);
        },
        (error) => {
          this.loading = false;

          // TODO Handle Error
        }
      );
    }
  }

  public openFilterDialog() {
    let dialogRef = this.dialog.open(SearchFilterComponent, {
      panelClass: 'search-filter-dialog'
    });

    dialogRef.afterClosed().subscribe((filterCriteria) => {
      if (filterCriteria) {
        this.currentFilterCriteria = filterCriteria;

        this.loading = true;

        this.reportResults = new Array<SearchResult>();

        this.runReport();
      }
    });
  }

  public runReport(initialRun: boolean = false) {
    gtag('event', 'search', {
      'event_category': 'search'
    });

    return this.searchService.runReport(this.currentFilterCriteria).subscribe(
      (response : SearchResult[]) => {
        if ((response == null || response.length == 0) && initialRun) {
          this.currentFilterCriteria.onlineOnly = true;
          this.runReport(false);

          return;
        }

        var imageIds = new Array<string>();
        for (var index = 0; index < response.length; index++) {
          var searchResult = response[index];
          searchResult.order = searchResult.order + ((this.currentFilterCriteria.currentPage + 1) * this.currentFilterCriteria.pageSize);

          if (searchResult.user && searchResult.user.imageId) {
            imageIds.push(searchResult.user.imageId);
          }

          if (searchResult.group && searchResult.group.imageId) {
            imageIds.push(searchResult.group.imageId);
          }
        }

        if (imageIds.length > 0) {
          this.imageService.getMultiple(imageIds).subscribe(
            (imageResponse) => {
              for (var index = 0; index < response.length; index++) {
                this.reportResults.push(response[index]);
              }

              this.reportResults.sort(function(a, b) {
                  return a.order - b.order;
              });

              this.loading = false;
            },
            (error) => {
              for (var index = 0; index < response.length; index++) {
                this.reportResults.push(response[index]);
              }

              this.reportResults.sort(function(a, b) {
                  return a.order - b.order;
              });

              this.loading = false;
            }
          );
        } else {
          for (var index = 0; index < response.length; index++) {
            this.reportResults.push(response[index]);
          }

          this.reportResults.sort(function(a, b) {
              return a.order - b.order;
          });

          this.loading = false;
        }
      },
      (error) => {
        this.loading = false;

        // TODO Handle Error
      }
    );
  }

  public getSearchTipMessage() {
    var messages = [
      "Why don't you create a group matching your interests?"
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }
}
