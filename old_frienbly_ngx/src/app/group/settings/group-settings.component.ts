import {Injectable, Component, Input, Output, OnInit, EventEmitter, ViewChild, OnDestroy} from '@angular/core';
import {MatDialog} from '@angular/material';
import {Observable} from 'rxjs/Observable';
import {AsyncSubject} from 'rxjs/AsyncSubject';

import {RoutingService} from '../../common/services/routing.service';
import {RouteProvider} from '../../routes/route.provider';

import {UserDetailsService} from '../../user/services/user-details.service';
import {GeolocationService} from '../../common/services/geolocation.service';
import {GroupService} from '../../common/services/groups/group.service';
import {GroupChangeListener} from '../../common/services/groups/group-change.listener';
import {GroupDetailsService} from '../services/group-details.service';
import {TagService} from '../../common/services/tags/tag.service';
import {GroupDetailsChangeListener} from '../services/group-details.change.listener';

import {GroupSettingsState} from './group-settings.state';
import {Group} from '../../common/contracts/group/models/group';
import {GroupDetails} from '../../common/contracts/group/models/group-details';
import {GroupTag} from '../../common/contracts/group/models/group-tag';
import {StreetLocation} from '../../common/contracts/geolocation/street-location';

import {NavigationGuardService} from '../../common/components/guards/services/navigation.guard.service';
import {ImageService} from '../../common/services/image.service';
import {FileHolder} from '../../common/components/image-uploader/image-upload/image-upload.component';

import {ConfirmationDialogComponent} from '../../common/components/dialogs/confirmation/confirmation-dialog.component';

import {environment} from '../../../environments/environment';

@Component({
  selector: 'group-settings',
  templateUrl: './group-settings.component.html',
  styleUrls: ['./group-settings.component.scss']
})
@Injectable()
export class GroupSettingsComponent implements OnInit, OnDestroy, GroupDetailsChangeListener, GroupChangeListener {
  GroupSettingsState = GroupSettingsState;

  isErrored: boolean = false;
  loading: boolean = false;

  updatedGroupDetails: GroupDetails = null;
  removedImageId: string;
  updatedImage: FileHolder = null;

  currentSettingsState: GroupSettingsState = GroupSettingsState.GENERAL_INFORMATION;

  generalInformationValid: boolean = true;
  searchPreferencesValid: boolean = true;

  constructor(
    private dialog: MatDialog,
    private navigationGuardService: NavigationGuardService,
    private groupService: GroupService,
    private groupDetailsService: GroupDetailsService,
    private geolocationService: GeolocationService,
    private imageService: ImageService,
    private tagService: TagService,
    private userDetailsService: UserDetailsService,
    private routingService: RoutingService
  ) {}

  public ngOnInit() {
    this.groupDetailsService.registerGroupDetailsChangeListener(this);
    this.groupService.registerGroupChangeListener(this);
    this.navigationGuardService.setCanDeactivateCallback(this.canNavigateAway.bind(this));

    this.handleGroupChange(this.groupService.getSelectedGroup());
  }

  public ngOnDestroy() {
    this.groupDetailsService.unregisterGroupDetailsChangeListener(this);
    this.groupService.unregisterGroupChangeListener(this);
    this.navigationGuardService.setCanDeactivateCallback(null);
  }

  public handleGroupChange(group: Group) {
    if (group && this.updatedGroupDetails && group.id == this.updatedGroupDetails.id) {
      return;
    }

    this.loading = true;
    this.generalInformationValid = group != null;
    this.searchPreferencesValid = true;
    setTimeout(() => {
      if (!group) {
        this.loading = true;
        this.userDetailsService.get().subscribe(
          (response) => {
            var groupDetails = new GroupDetails();

            groupDetails.onlineOnly = response.onlineOnly;
            groupDetails.latitude = response.latitude;
            groupDetails.longitude = response.longitude;
            groupDetails.city = response.city;
            groupDetails.postalCode = response.postalCode;
            groupDetails.province = response.province;
            groupDetails.country = response.country;
            groupDetails.lookingForIndividuals = true;
            groupDetails.lookingForGroups = true;

            this.finishGroupDetailLoad(groupDetails);

            this.loading = false;
          },
          (error) => {
            this.finishGroupDetailLoad(new GroupDetails());

            this.loading = false;
          }
        );

      } else {
        this.loading = true;

        // TODO Check for admin and if not, redirect home.
        this.groupDetailsService.get(group.id).subscribe(
          (groupDetails) => {
            this.finishGroupDetailLoad(groupDetails);
            this.loading = false;
          },
          (error) => {
            console.log(error);

            this.loading = false;
          }
        );
      }
    }, 0);
  }

  public canNavigateAway = () : Observable<boolean> => {
    var requestSubject = new AsyncSubject<boolean>();
    if (!this.groupService.getSelectedGroup() || !this.updatedGroupDetails.id) {
      let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: environment.dialogs.width,
        data: {
          titleText: 'Unsaved Changes?',
          bodyText: 'Are you sure you want to lose your unsaved changes?',
          confirmationButton: true,
          confirmationButtonText: 'Yes',
          closeButtonText: 'Cancel'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        requestSubject.next(result);
        requestSubject.complete();
      });

      return requestSubject;
    }

    this.groupDetailsService.get(this.updatedGroupDetails.id).subscribe(
      (currentGroupDetails) => {
        if (JSON.stringify(currentGroupDetails) != JSON.stringify(this.updatedGroupDetails)) {
          let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: environment.dialogs.width,
            data: {
              titleText: 'Unsaved Changes?',
              bodyText: 'Are you sure you want to lose your unsaved changes?',
              confirmationButton: true,
              confirmationButtonText: 'Yes',
              closeButtonText: 'Cancel'
            }
          });

          dialogRef.afterClosed().subscribe(result => {
            requestSubject.next(result);
            requestSubject.complete();
          });
        } else {
          requestSubject.next(true);
          requestSubject.complete();
        }
      }
    );

    return requestSubject;
  }

  public handleSave() {
    this.loading = true;
    if (!this.groupService.getSelectedGroup()) {
      var newGroup = new Group();
      newGroup.name = this.updatedGroupDetails.name;
      newGroup.enabled = true;

      this.groupService.save(newGroup).subscribe(
        (createdGroup) => {
          this.updatedGroupDetails.id = createdGroup.id;
          this.updatedGroupDetails.name = createdGroup.name;

          this.groupService.setSelectedGroup(createdGroup);

          this.saveGroup();
        },
        (error) => {
          console.log(error);

          this.loading = false;
        }
      );
    } else {
      this.saveGroup();
    }
  }
  public saveGroup() {
    this.groupDetailsService.get(this.updatedGroupDetails.id).subscribe(
      (currentGroupDetails) => {
        if (JSON.stringify(currentGroupDetails) != JSON.stringify(this.updatedGroupDetails)) {
          if (this.areLocationSettingsDifferent(currentGroupDetails, this.updatedGroupDetails)) {
            this.populateLatLong(this.updatedGroupDetails).subscribe(
              (updatedDetails) => {
                this.saveImageRemovalUpdateAndDetails(currentGroupDetails);
              },
              (error) => {
                this.saveImageRemovalUpdateAndDetails(currentGroupDetails);
              }
            )
          } else {
            this.saveImageRemovalUpdateAndDetails(currentGroupDetails);
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
  private saveImageRemovalUpdateAndDetails(currentGroupDetails: GroupDetails) {
    if (this.removedImageId) {
      this.imageService.delete(this.removedImageId).subscribe(
        (response) => {
          this.saveImageUpdateAndDetails(currentGroupDetails);
        },
        (error) => {
          this.saveImageUpdateAndDetails(currentGroupDetails);
        }
      );
    } else {
      this.saveImageUpdateAndDetails(currentGroupDetails);
    }
    this.removedImageId = null;
  }
  private saveImageUpdateAndDetails(currentGroupDetails: GroupDetails) {
    if (this.updatedImage && this.updatedImage.newFile) {
      this.imageService.upload(this.updatedImage.imageId, this.updatedImage.file).subscribe(
        (response) => {
          this.saveTagsAndDetails(currentGroupDetails);
        },
        (error) => {
          this.saveTagsAndDetails(currentGroupDetails);
        }
      );
    } else {
      this.saveTagsAndDetails(currentGroupDetails);
    }
    this.updatedImage = null;
  }
  private saveTagsAndDetails(currentGroupDetails: GroupDetails) {
    if (JSON.stringify(currentGroupDetails.groupTags) != JSON.stringify(this.updatedGroupDetails.groupTags)) {
      this.tagService.saveCurrentGroupTags(this.updatedGroupDetails.id, this.updatedGroupDetails.groupTags).subscribe(
        (response: GroupTag[]) => {
          this.updatedGroupDetails.groupTags = response;
          this.saveDetails();
        },
        (error) => {
          this.saveDetails();
        }
      )
    } else {
      this.saveDetails();
    }
  }
  private saveDetails() {
    this.groupDetailsService.save(this.updatedGroupDetails).subscribe(
      (groupDetails) => {
        this.finishGroupDetailLoad(groupDetails);
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
    this.routingService.navigateTo(RouteProvider.getGroupSearchRoute(), {});
  }

  private areLocationSettingsDifferent(currentGroupDetails: GroupDetails, updatedGroupDetails: GroupDetails) {
    return currentGroupDetails.street != updatedGroupDetails.street ||
      currentGroupDetails.city != updatedGroupDetails.city ||
      currentGroupDetails.province != updatedGroupDetails.province ||
      currentGroupDetails.postalCode != updatedGroupDetails.postalCode ||
      currentGroupDetails.country != updatedGroupDetails.country ||
      (!updatedGroupDetails.onlineOnly && (updatedGroupDetails.latitude == 0 || updatedGroupDetails.longitude == 0));
  }
  private populateLatLong(groupDetails: GroupDetails) : Observable<GroupDetails> {
    var requestSubject = new AsyncSubject<GroupDetails>();
    var streetLocation = new StreetLocation();

    streetLocation.street = groupDetails.street;
    streetLocation.city = groupDetails.city;
    streetLocation.province = groupDetails.province;
    streetLocation.postalCode = groupDetails.postalCode;
    streetLocation.country = groupDetails.country;

    this.userDetailsService.get().subscribe(
      (response) => {
        if (!streetLocation.street
          && streetLocation.city == response.city
          && streetLocation.province == response.province
          && streetLocation.postalCode == response.postalCode
          && streetLocation.country == response.country
        ) {
          streetLocation.latitude = response.latitude;
          streetLocation.longitude = response.longitude;
        }


        if (!streetLocation.longitude || !streetLocation.longitude || (streetLocation.longitude == 0 && streetLocation.latitude == 0)) {
          this.geolocationService.getGeolocationDetails(streetLocation).subscribe((resolvedStreetLocation: StreetLocation) => {
            groupDetails.latitude = resolvedStreetLocation.latitude;
            groupDetails.longitude = resolvedStreetLocation.longitude;

            requestSubject.next(groupDetails);
            requestSubject.complete();
          },
          (error) => {
            requestSubject.next(groupDetails);
            requestSubject.complete();
          });
        } else {
          groupDetails.latitude = streetLocation.latitude;
          groupDetails.longitude = streetLocation.longitude;

          requestSubject.next(groupDetails);
          requestSubject.complete();
        }
      },
      (error) => {
        requestSubject.next(groupDetails);
        requestSubject.complete();
      }
    );

    return requestSubject;
  }

  private finishGroupDetailLoad(loadedGroupDetails: GroupDetails) {
    this.updatedGroupDetails = JSON.parse(JSON.stringify(loadedGroupDetails));
  }


  public transitionState(newState: GroupSettingsState) {
    this.currentSettingsState = newState;
  }

  public handleGroupDetailsChange(groupDetails: GroupDetails) {
    this.updatedGroupDetails.onlineOnly = groupDetails.onlineOnly;
    this.updatedGroupDetails.lookingForIndividuals = groupDetails.lookingForIndividuals;
    this.updatedGroupDetails.lookingForGroups = groupDetails.lookingForGroups;
  }

  public generalInformationValidStateChanged(valid: boolean) {
    this.generalInformationValid = valid;
  }

  public searchPreferencesValidStateChanged(valid: boolean) {
    this.searchPreferencesValid = valid;
  }

  public imageRemoved(image: FileHolder) {
    if (!this.removedImageId && this.updatedGroupDetails.imageId) {
      this.removedImageId = this.updatedGroupDetails.imageId;
      this.updatedGroupDetails.imageId = null;
    }
  }

  public imageChanged(image: FileHolder) {
    this.updatedImage = image;

    this.updatedGroupDetails.imageId = image.imageId;
    this.updatedGroupDetails.imageRotation = image.rotation;
  }

  public getSaveButtonText() {
    return this.updatedGroupDetails && this.updatedGroupDetails.id > 0 ? 'Update Group' : 'Create Group';
  }
}
