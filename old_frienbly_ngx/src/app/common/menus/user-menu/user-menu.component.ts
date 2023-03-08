import {Component, OnInit, OnDestroy} from '@angular/core';
import {MatDialog} from '@angular/material';

import {AuthenticationService} from '../../services/authentication.service';
import {RoutingService} from '../../services/routing.service';

import {RouteProvider} from '../../../routes/route.provider';

import {BlockService} from '../../services/block.service';
import {UserDetailsService} from '../../../user/services/user-details.service';

import {UserBlockManagementDialogComponent} from '../../../user/block/user-block-management.dialog.component';

import { UserCardDetailsDialogComponent } from '../../../user/card/details/user-card.details.dialog';

@Component({
  selector: 'user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent implements OnInit, OnDestroy {

  public blockedIds: Array<number>;

  constructor(
    private dialog: MatDialog,
    private authenticationService: AuthenticationService,
    private routingService: RoutingService,
    private blockService: BlockService,
    private userDetailsService: UserDetailsService
  ) {
  }

  public ngOnInit() {
    this.blockService.addBlocksAlteredCallbacks(this.blocksAltered.bind(this));
    this.blockService.getBlockedUserIds().subscribe((blockedIds) => {
      this.blocksAltered(blockedIds);
    });
  }

  public ngOnDestroy() {
    this.blockService.removeBlocksAlteredCallbacks(this.blocksAltered.bind(this));
  }

  public blocksAltered = (blockedIds: Array<number>) => {
    this.blockedIds = blockedIds;
  }

  logout() {
    this.authenticationService.logout();
  }

  public manageBlockedUsers() {
    this.dialog.open(UserBlockManagementDialogComponent, {
      panelClass: 'details-card-dialog',
      data: {}
    });
  }

  public navigateToAccountSettings() {
    this.routingService.navigateTo(RouteProvider.getUserAccountSettingsRoute(), {});
  }

  public displayPersonalCard() {
    this.userDetailsService.get().subscribe((response) => {
      this.dialog.open(UserCardDetailsDialogComponent, {
        panelClass: 'details-card-dialog',
        data: {
          user: response,
          hideOptions: true
        }
      });
    });
  }
}
