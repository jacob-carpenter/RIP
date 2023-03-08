import {Component} from '@angular/core';
import {MatDialog} from '@angular/material';

import {ConfirmationDialogComponent} from '../../components/dialogs/confirmation/confirmation-dialog.component';

import {GroupService} from '../../services/groups/group.service';
import {GroupDetailsService} from '../../../group/services/group-details.service';

import {RouteProvider} from '../../../routes/route.provider';
import {RoutingService} from '../../services/routing.service';

import {environment} from '../../../../environments/environment';

import {GroupCardDetailsDialogComponent} from '../../../group/card/details/group-card.details.dialog';
import {GroupMemberManagementDialogComponent} from '../../../group/members/group-member-management.dialog.component';


@Component({
  selector: 'group-menu',
  templateUrl: './group-menu.component.html',
  styleUrls: ['./group-menu.component.scss']
})
export class GroupMenuComponent {

  constructor(
    public groupService: GroupService,
    public groupDetailsService: GroupDetailsService,
    private routingService: RoutingService,
    private dialog: MatDialog
  ) {}

  public createGroup() {
    this.groupService.setSelectedGroup(null);

    this.routingService.navigateTo(RouteProvider.getGroupSettingsRoute(), {})
  }

  public aboutGroup() {

    this.groupDetailsService.get(this.groupService.getSelectedGroup().id).subscribe((response) => {
      let dialogRef = this.dialog.open(GroupCardDetailsDialogComponent, {
        panelClass: 'details-card-dialog',
        data: {
          group: response,
          hideOptions: true
        }
      });
    });
  }

  public modifyGroup() {
    this.routingService.navigateTo(RouteProvider.getGroupSettingsRoute(), {})
  }

  public modifyGroupMembers() {
    this.groupDetailsService.get(this.groupService.getSelectedGroup().id).subscribe((response) => {
      let dialogRef = this.dialog.open(GroupMemberManagementDialogComponent, {
        panelClass: 'details-card-dialog',
        data: {
          group: response
        }
      });
    });
  }

  public leaveGroup() {

    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: environment.dialogs.width,
      data: {
        titleText: 'Leave ' + this.groupService.getSelectedGroup().name + '?',
        bodyText: 'Are you sure you want to leave ' + this.groupService.getSelectedGroup().name + '?',
        confirmationButton: true,
        confirmationButtonText: 'Leave Group',
        closeButtonText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.groupService.leave(this.groupService.getSelectedGroup()).subscribe(
          (response) => {
            this.routingService.navigateTo(RouteProvider.getHomeRoute(), {})
          }
        );
      }
    });
  }
}
