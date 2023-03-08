import {Injectable, Component, Input, Output, OnInit, EventEmitter, ViewChild, OnDestroy, Inject} from '@angular/core';
import {MatDialog} from '@angular/material';
import {Observable} from 'rxjs/Observable';
import {AsyncSubject} from 'rxjs/AsyncSubject';

import {RoutingService} from '../../common/services/routing.service';
import {RouteProvider} from '../../routes/route.provider';

import {GeolocationService} from '../../common/services/geolocation.service';
import {UserDetailsService} from '../services/user-details.service';
import {TagService} from '../../common/services/tags/tag.service';
import {UserDetailsChangeListener} from '../services/user-details.change.listener';

import {UserSettingsState} from './user-settings.state';
import {UserDetails} from '../../common/contracts/user/models/user-details';
import {UserTag} from '../../common/contracts/user/models/user-tag';
import {StreetLocation} from '../../common/contracts/geolocation/street-location';

import {NavigationGuardService} from '../../common/components/guards/services/navigation.guard.service';
import {ImageService} from '../../common/services/image.service';
import {FileHolder} from '../../common/components/image-uploader/image-upload/image-upload.component';

import {ConfirmationDialogComponent} from '../../common/components/dialogs/confirmation/confirmation-dialog.component';

import {environment} from '../../../environments/environment';

@Component({
  selector: 'user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
@Injectable()
export class UserSettingsComponent implements OnInit, OnDestroy, UserDetailsChangeListener {
  UserSettingsState = UserSettingsState;

  saved: boolean = false;
  isErrored: boolean = false;
  loading: boolean = false;

  updatedUserDetails: UserDetails = null;
  removedImageId: string;
  updatedImage: FileHolder = null;

  currentSettingsState: UserSettingsState = UserSettingsState.GENERAL_INFORMATION;

  generalInformationValid: boolean = true;
  searchPreferencesValid: boolean = true;
  accountSettingsValid: boolean = true;

  constructor(
    private dialog: MatDialog,
    @Inject(NavigationGuardService) private navigationGuardService: NavigationGuardService,
    private userDetailsService: UserDetailsService,
    private geolocationService: GeolocationService,
    private imageService: ImageService,
    private tagService: TagService,
    private routingService: RoutingService
  ) {}

  public ngOnInit() {
    this.navigationGuardService.setCanDeactivateCallback(this.canNavigateAway.bind(this));

    this.loading = true;
    this.userDetailsService.get().subscribe(
      (userDetails) => {
        this.userDetailsService.registerUserDetailsChangeListener(this);
        this.finishUserDetailLoad(userDetails);
        this.loading = false;
      },
      (error) => {
        console.log(error);

        this.loading = false;
      }
    );
  }

  public ngOnDestroy() {
    this.userDetailsService.unregisterUserDetailsChangeListener(this);
    this.navigationGuardService.setCanDeactivateCallback(null);
  }

  public canNavigateAway = () : Observable<boolean> => {
    var requestSubject = new AsyncSubject<boolean>();

    if (this.saved) {
      requestSubject.next(true);
      requestSubject.complete();
      return requestSubject;
    }

    this.userDetailsService.get().subscribe(
      (currentUserDetails) => {
        if (JSON.stringify(currentUserDetails) != JSON.stringify(this.updatedUserDetails)) {
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
    )

    return requestSubject;
  }

  public handleSave() {
    // Get latest to make sure we are truly different
    this.loading = true;
    this.userDetailsService.get().subscribe(
      (currentUserDetails) => {
        if (JSON.stringify(currentUserDetails) != JSON.stringify(this.updatedUserDetails)) {
          if (this.areLocationSettingsDifferent(currentUserDetails, this.updatedUserDetails)) {
            this.populateLatLong(this.updatedUserDetails).subscribe(
              (updatedDetails) => {
                this.saveImageRemovalUpdateAndDetails(currentUserDetails);
              },
              (error) => {
                this.saveImageRemovalUpdateAndDetails(currentUserDetails);
              }
            )
          } else {
            this.saveImageRemovalUpdateAndDetails(currentUserDetails);
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
  private saveImageRemovalUpdateAndDetails(currentUserDetails: UserDetails) {
    if (this.removedImageId) {
      this.imageService.delete(this.removedImageId).subscribe(
        (response) => {
          this.saveImageUpdateAndDetails(currentUserDetails);
        },
        (error) => {
          this.saveImageUpdateAndDetails(currentUserDetails);
        }
      );
    } else {
      this.saveImageUpdateAndDetails(currentUserDetails);
    }
    this.removedImageId = null;
  }
  private saveImageUpdateAndDetails(currentUserDetails: UserDetails) {
    if (this.updatedImage && this.updatedImage.newFile) {
      this.imageService.upload(this.updatedImage.imageId, this.updatedImage.file).subscribe(
        (response) => {
          this.saveTagsAndDetails(currentUserDetails);
        },
        (error) => {
          this.saveTagsAndDetails(currentUserDetails);
        }
      );
    } else {
      this.saveTagsAndDetails(currentUserDetails);
    }
    this.updatedImage = null;
  }
  private saveTagsAndDetails(currentUserDetails: UserDetails) {
    if (JSON.stringify(currentUserDetails.userTags) != JSON.stringify(this.updatedUserDetails.userTags)) {
      this.tagService.saveCurrentUserTags(this.updatedUserDetails.userTags).subscribe(
        (response: UserTag[]) => {
          this.updatedUserDetails.userTags = response;
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
    this.userDetailsService.save(this.updatedUserDetails).subscribe(
      (userDetails) => {
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
    this.saved = true;
    this.routingService.navigateTo(RouteProvider.getHomeRoute(), {});
  }

  private areLocationSettingsDifferent(currentUserDetails: UserDetails, updatedUserDetails: UserDetails) {
    return currentUserDetails.street != updatedUserDetails.street ||
      currentUserDetails.city != updatedUserDetails.city ||
      currentUserDetails.province != updatedUserDetails.province ||
      currentUserDetails.postalCode != updatedUserDetails.postalCode ||
      currentUserDetails.country != updatedUserDetails.country;
  }
  private populateLatLong(userDetails: UserDetails) : Observable<UserDetails> {
    var streetLocation = new StreetLocation();

    streetLocation.street = userDetails.street;
    streetLocation.city = userDetails.city;
    streetLocation.province = userDetails.province;
    streetLocation.postalCode = userDetails.postalCode;
    streetLocation.country = userDetails.country;

    return this.geolocationService.getGeolocationDetails(streetLocation).map((resolvedStreetLocation: StreetLocation) => {
      userDetails.latitude = resolvedStreetLocation.latitude;
      userDetails.longitude = resolvedStreetLocation.longitude;

      return userDetails;
    });
  }

  private finishUserDetailLoad(loadedUserDetails: UserDetails) {
    this.updatedUserDetails = JSON.parse(JSON.stringify(loadedUserDetails));
  }


  public transitionState(newState: UserSettingsState) {
    this.currentSettingsState = newState;
  }

  public handleUserDetailsChange(userDetails: UserDetails) {
    this.updatedUserDetails.onlineOnly = userDetails.onlineOnly;
    this.updatedUserDetails.lookingForIndividuals = userDetails.lookingForIndividuals;
    this.updatedUserDetails.lookingForGroups = userDetails.lookingForGroups;
  }

  public generalInformationValidStateChanged(valid: boolean) {
    this.generalInformationValid = valid;
  }

  public searchPreferencesValidStateChanged(valid: boolean) {
    this.searchPreferencesValid = valid;
  }

  public accountSettingsValidStateChanged(valid: boolean) {
    this.accountSettingsValid = valid;
  }

  public imageRemoved(image: FileHolder) {
    if (!this.removedImageId && this.updatedUserDetails.imageId) {
      this.removedImageId = this.updatedUserDetails.imageId;
      this.updatedUserDetails.imageId = null;
    }
  }

  public imageChanged(image: FileHolder) {
    this.updatedImage = image;

    this.updatedUserDetails.imageId = image.imageId;
    this.updatedUserDetails.imageRotation = image.rotation;
  }
}
