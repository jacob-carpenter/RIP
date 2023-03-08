import {Component, Input, OnInit, OnDestroy, Output, EventEmitter} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

import {RouteProvider} from '../../../routes/route.provider';
import {RoutingService} from '../../services/routing.service';

import {Group} from '../../contracts/group/models/group';
import {GroupMember} from '../../contracts/group/models/group-member';
import {GroupMemberType} from '../../contracts/group/models/group-member-type';

import {GroupService} from '../../services/groups/group.service';
import {UserDetailsService} from '../../../user/services/user-details.service';
import {UserDetails} from '../../contracts/user/models/user-details';

import {ImageService} from '../../services/image.service';
import {NavigationGuardService} from '../../components/guards/services/navigation.guard.service';

import {UserDetailsChangeListener} from '../../../user/services/user-details.change.listener';

@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss']
})
export class LeftMenuComponent implements OnInit, OnDestroy, UserDetailsChangeListener {
  @Input()
  public isLeftMenuExpanded: boolean;
  @Input()
  public isMobile: boolean;

  @Output()
  public leftMenuToggled: EventEmitter<any> = new EventEmitter();

  public homeRoutePath: string = RouteProvider.getHomeRoute().path;
  public loading: boolean = false;
  public userDetails: UserDetails;
  public currentGroups: GroupMember[];

  public onlineOnlyToggleEnabled: boolean = false;
  public onlineOnlyToggleTooltip: string;

  constructor(
    private router: Router,
    private routingService: RoutingService,
    private userDetailsService: UserDetailsService,
    public groupService: GroupService,
    private imageService: ImageService,
    private navigationGuardService: NavigationGuardService
  ) {}

  public ngOnInit() {
    this.userDetailsService.get().subscribe(
      (userDetails) => {
        this.handleUserDetailsChange(userDetails);
        this.userDetailsService.registerUserDetailsChangeListener(this);
      },
      (error) => {
        console.debug(error);
      }
    );

    this.groupService.getGroupsByMemberType(GroupMemberType.ADMIN).subscribe(
      (response) => {
        var imageIds = [];
        for (var index = 0; index < response.length; index++) {
          var groupMember = response[index];

          if (groupMember.groupDetails && groupMember.groupDetails.imageId) {
            imageIds.push(groupMember.groupDetails.imageId);
          }
        }

        if (imageIds.length > 0) {
          this.imageService.getMultiple(imageIds).subscribe(() => {
            this.currentGroups = response;
          });
        } else {
          this.currentGroups = response;
        }
      },
      (error) => {
        console.debug(error);
      }
    )
  }

  public ngOnDestroy() {
    this.userDetailsService.unregisterUserDetailsChangeListener(this);
  }

  public handleUserDetailsChange(userDetails: UserDetails) {
    this.userDetails = userDetails;
    if (
      (!this.userDetails.latitude || this.userDetails.latitude == 0)
      && (!this.userDetails.longitude || this.userDetails.longitude == 0)
    ) {
      this.onlineOnlyToggleEnabled = false;
      this.onlineOnlyToggleTooltip = 'Could not determine your location. Set location via Account Settings to enable location searches.';
    } else {
      this.onlineOnlyToggleEnabled = true;
      this.onlineOnlyToggleTooltip = null;
    }
  }

  public toggleOnlineOnly() {
    this.userDetails.onlineOnly = !this.userDetails.onlineOnly;
    this.saveUserDetails();
  }

  public toggleSeekingIndividuals() {
    this.userDetails.lookingForIndividuals = !this.userDetails.lookingForIndividuals;
    this.saveUserDetails();
  }

  public toggleSeekingGroups() {
    this.userDetails.lookingForGroups = !this.userDetails.lookingForGroups;
    this.saveUserDetails();
  }

  public saveUserDetails() {
    this.userDetailsService.get().subscribe(
      (currentUserDetails) => {
        currentUserDetails.onlineOnly = this.userDetails.onlineOnly;
        currentUserDetails.lookingForIndividuals = this.userDetails.lookingForIndividuals;
        currentUserDetails.lookingForGroups = this.userDetails.lookingForGroups;
        return  this.userDetailsService.save(currentUserDetails).subscribe(
          (userDetails) => {},
          (error) => {
            console.log(error);
          }
        );
      },
      (error) => {
        console.log(error);
      }
    );
  }

  public groupSelected(group: Group) {
    var previousSelectedGroup = this.groupService.getSelectedGroup();

    if (previousSelectedGroup && previousSelectedGroup.id == group.id) {
      return;
    }

    if (this.router.url.indexOf('/' + RouteProvider.getGroupSettingsRoute().path) == 0) {
      this.navigationGuardService.canDeactivate().subscribe((canDeactivate) => {
        if (canDeactivate) {
          this.setSelectedGroup(previousSelectedGroup, group, false);
        }
      });
    } else {
      this.setSelectedGroup(previousSelectedGroup, group, true);
    }
  }

  private setSelectedGroup(previousSelectedGroup: Group, group: Group, navigateAway: boolean) {
    this.groupService.setSelectedGroup(group);
    if (previousSelectedGroup) {
      this.leftMenuToggled.emit({});
    } else if (navigateAway) {
      this.routingService.navigateTo(RouteProvider.getGroupSearchRoute(), {});
    }
  }
}
