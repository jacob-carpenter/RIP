import {Component, Inject, Input, Output, EventEmitter, OnInit, OnDestroy} from '@angular/core';
import {MatDialog} from '@angular/material';

import {Chat} from '../../../common/contracts/chat/chat';
import {ChatType} from '../../../common/contracts/chat/chat-type';
import {UserDetails} from '../../../common/contracts/user/models/user-details';
import {Group} from '../../../common/contracts/group/models/group';
import {GroupDetails} from '../../../common/contracts/group/models/group-details';

import {GroupService} from '../../../common/services/groups/group.service';
import {GroupChangeListener} from '../../../common/services/groups/group-change.listener';
import {UserDetailsService} from '../../../user/services/user-details.service';
import {UserDetailsChangeListener} from '../../../user/services/user-details.change.listener';
import {GroupDetailsService} from '../../../group/services/group-details.service';

import {UserCardDetailsDialogComponent} from '../../../user/card/details/user-card.details.dialog';
import {GroupCardDetailsDialogComponent} from '../../../group/card/details/group-card.details.dialog';

import {environment} from '../../../../environments/environment';

@Component({
  selector: 'search-header',
  templateUrl: './search-header.component.html',
  styleUrls: ['./search-header.component.scss']
})
export class SearchHeaderComponent implements OnInit, OnDestroy, GroupChangeListener, UserDetailsChangeListener {
  public loading: boolean = false;

  public currentSearchUser: UserDetails;
  public currentSearchGroup: GroupDetails;

  constructor(
    private dialog: MatDialog,
    private groupService: GroupService,
    private userDetailsService: UserDetailsService,
    private groupDetailsService: GroupDetailsService
  ) {}

  public ngOnInit() {
    this.groupService.registerGroupChangeListener(this);
    this.userDetailsService.registerUserDetailsChangeListener(this);
    this.handleGroupChange(this.groupService.getSelectedGroup());
  }

  public ngOnDestroy() {
    this.groupService.unregisterGroupChangeListener(this);
    this.userDetailsService.unregisterUserDetailsChangeListener(this);
  }

  public handleGroupChange(group: Group) {
    this.loading = true;
    setTimeout(() => {
      if (group) {
        this.groupDetailsService.get(this.groupService.getSelectedGroup().id).subscribe((group) => {
          this.currentSearchGroup = group;
          this.loading = false;
        });
      } else {
        this.userDetailsService.get().subscribe((user) => {
          this.currentSearchUser = user;
          this.loading = false;
        });
      }
    }, 0);
  }

  public handleUserDetailsChange(userDetails: UserDetails) {
    this.handleGroupChange(this.groupService.getSelectedGroup());
  }

  public openUserCard() {
    this.dialog.open(UserCardDetailsDialogComponent, {
      panelClass: 'details-card-dialog',
      data: {
        user: this.currentSearchUser,
        disableGroupChat: true,
        hideOptions: true
      }
    });
  }

  public openGroupCard() {
    this.dialog.open(GroupCardDetailsDialogComponent, {
      panelClass: 'details-card-dialog',
      data: {
        group: this.currentSearchGroup,
        hideOptions: true
      }
    });
  }
}
