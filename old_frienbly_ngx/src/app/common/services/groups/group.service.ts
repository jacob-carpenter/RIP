import {Injectable, OnInit} from '@angular/core';
import {Router, Routes, Route, NavigationEnd, ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {AsyncSubject} from 'rxjs/AsyncSubject';

import {SessionStorageService} from 'ngx-webstorage';

import {HttpRequest, HttpClient, HttpParams, HttpHeaders, HttpEvent, HttpResponse} from "@angular/common/http";

import {RouteProvider} from '../../../routes/route.provider';
import {Group} from '../../contracts/group/models/group';
import {GroupDetails} from '../../contracts/group/models/group-details';
import {GroupMember} from '../../contracts/group/models/group-member';
import {GroupMemberType} from '../../contracts/group/models/group-member-type';
import {AddMemberRequest} from '../../contracts/group/models/requests/add-member.request';
import {RemoveMemberRequest} from '../../contracts/group/models/requests/remove-member.request';
import {GroupChangeListener} from './group-change.listener';

import {EventService} from '../event.service';
import {UserDetailsService} from '../../../user/services/user-details.service';

import {environment} from '../../../../environments/environment';

@Injectable()
export class GroupService {
  private selectedGroup: Group;
  private isSelectedGroupAdmin: boolean;

  private groupDetailsChangeListeners: GroupChangeListener[] = new Array<GroupChangeListener>();

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private storage: SessionStorageService,
    private userDetailsService: UserDetailsService,
    private eventService: EventService
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd ) {
        if (this.router.url.indexOf('/' + RouteProvider.getGroupSettingsRoute().path) < 0
          && this.router.url.indexOf('/' + RouteProvider.getGroupSearchRoute().path) < 0) {
            this.setSelectedGroup(null);
        } else if (
          this.router.url.indexOf('/' + RouteProvider.getGroupSearchRoute().path) == 0
          && this.getSelectedGroup() == null
        ) {
          this.router.navigate(['/'], {});
        }
      }
    });
  }

  public registerGroupChangeListener(groupDetailsChangeListener: GroupChangeListener) {
    this.groupDetailsChangeListeners.push(groupDetailsChangeListener);
  }

  public unregisterGroupChangeListener(groupDetailsChangeListener: GroupChangeListener) {
    var index = this.groupDetailsChangeListeners.indexOf(groupDetailsChangeListener, 0);
    if (index > -1) {
       this.groupDetailsChangeListeners.splice(index, 1);
    }
  }

  public getSelectedGroup() : Group {
    return this.selectedGroup;
  }

  public setSelectedGroup(group: Group) {
    this.selectedGroup = group;
    this.isSelectedGroupAdmin = false;

    if (this.selectedGroup) {
      this.getGroupsByMemberType(GroupMemberType.ADMIN).subscribe((response: GroupMember[]) => {
        for (var index = 0; index < response.length; index++) {
          if (response[index].group.id == this.selectedGroup.id) {
            this.isSelectedGroupAdmin = true;

            for (var listenerIndex in this.groupDetailsChangeListeners) {
              this.groupDetailsChangeListeners[listenerIndex].handleGroupChange(this.selectedGroup);
            }
          }
        }
      });
    } else {
      for (var listenerIndex in this.groupDetailsChangeListeners) {
        this.groupDetailsChangeListeners[listenerIndex].handleGroupChange(this.selectedGroup);
      }
    }
  }

  public isUserAdminOfSelectedGroup() : boolean {
    return this.isSelectedGroupAdmin;
  }

  public updateCachedGroup(groupDetails: GroupDetails) {
    this.updateCachedGroupMembers(groupDetails, this.storage.retrieve(this.getGroupByMemberTypeCacheKey(GroupMemberType.ADMIN.toString())) as GroupMember[]);
    this.updateCachedGroupMembers(groupDetails, this.storage.retrieve(this.getGroupByMemberTypeCacheKey(GroupMemberType.MEMBER.toString())) as GroupMember[]);
  }

  private updateCachedGroupMembers(groupDetails: GroupDetails, groupMembers: GroupMember[]) {
    if (groupMembers) {
      for (var index = 0; index < groupMembers.length; index++) {
        var groupMember = groupMembers[index];

        if (groupMember && groupMember.groupDetails && groupMember.groupDetails.id == groupDetails.id) {
          groupMember.groupDetails = groupDetails;
        }
      }
    }
  }

  public getGroupsByMemberType(groupMemberType: GroupMemberType) : Observable<GroupMember[]> {
    var requestSubject = new AsyncSubject<GroupMember[]>();
    var groups = this.storage.retrieve(this.getGroupByMemberTypeCacheKey(groupMemberType.toString())) as GroupMember[];
    if (groups) {
      requestSubject.next(groups);
      requestSubject.complete();
      return requestSubject;
    }

    return this.httpClient.get(
      environment.apiUrl + '/api/group/byrole/' + groupMemberType,
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    )
    .map((response: GroupMember[]) => {
        this.storage.store(this.getGroupByMemberTypeCacheKey(groupMemberType.toString()), response);
        return response;
      }
    );
  }

  public getGroups() : Observable<GroupMember[]> {
    var requestSubject = new AsyncSubject<GroupMember[]>();
    var groups = this.storage.retrieve(this.getAllGroupsCacheKey()) as GroupMember[];
    if (groups) {
      requestSubject.next(groups);
      requestSubject.complete();
      return requestSubject;
    }

    return this.httpClient.get(
      environment.apiUrl + '/api/group',
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    )
    .map((response: GroupMember[]) => {
        this.storage.store(this.getAllGroupsCacheKey(), response);
        return response;
      }
    );
  }

  public get(groupId: number) : Observable<Group> {
    var requestSubject = new AsyncSubject<Group>();
    var group = this.storage.retrieve(this.getGroupCacheKey(groupId)) as Group;
    if (group) {
      requestSubject.next(group);
      requestSubject.complete();
      return requestSubject;
    }

    return this.httpClient.get(
      environment.apiUrl + '/api/group/' + groupId,
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    )
    .map((response: Group) => {
        this.storage.store(this.getGroupCacheKey(response.id), response);
        return response;
      }
    );
  }

  public getMembers(groupId: number) : Observable<GroupMember[]> {
    var requestSubject = new AsyncSubject<GroupMember[]>();
    var groupMembers = this.storage.retrieve(this.getMembersCacheKey(groupId)) as GroupMember[];
    if (groupMembers) {
      requestSubject.next(groupMembers);
      requestSubject.complete();
      return requestSubject;
    }

    return this.httpClient.get(
      environment.apiUrl + '/api/group/members/' + groupId,
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    )
    .map((response: GroupMember[]) => {
      this.storage.store(this.getMembersCacheKey(groupId), response);

      return response;
    });
  }

  private getMembersCacheKey(groupId: number) {
    return 'GroupService_getMembersCacheKey_' + groupId;
  }

  public addMember(addMemberRequest: AddMemberRequest) {
    return this.httpClient.post(
      environment.apiUrl + '/api/group/members/add',
      addMemberRequest,
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    )
    .map((response: GroupMember) => {

      this.userDetailsService.get().subscribe((response) => {
        if (response.id == addMemberRequest.userId) {
          this.eventService.refreshChatCache();

          this.storage.clear(this.getAllGroupsCacheKey());
        }
      });

      return response;
    });
  }

  public removeMember(removeMemberRequest: RemoveMemberRequest) {
    return this.httpClient.post(
      environment.apiUrl + '/api/group/members/remove/',
      removeMemberRequest,
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    )
    .map((response: GroupMember) => {
      this.userDetailsService.get().subscribe((response) => {
        if (response.id == removeMemberRequest.userId) {
          this.eventService.refreshChatCache();

          this.storage.clear(this.getAllGroupsCacheKey());
        }
      });

      return response;
    });
  }

  public leave(group: Group) : Observable<any> {
    return this.httpClient.post(
      environment.apiUrl + '/api/group/leave/' + group.id,
      null,
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    )
    .map((response: any) => {
      for (let item in GroupMemberType) {
        if (GroupMemberType.hasOwnProperty(item)) {
          this.storage.clear(this.getGroupByMemberTypeCacheKey(item));
        }
      }

      this.storage.clear(this.getAllGroupsCacheKey());
      this.eventService.refreshChatCache();

      return response;
    });
  }

  public save(group: Group) : Observable<Group> {
    var clearChats = false;
    if (!group.id) {
      clearChats = true;
    }

    return this.httpClient.post(
      environment.apiUrl + '/api/group',
      group,
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    )
    .map((response: Group) => {
        this.storage.store(this.getGroupCacheKey(response.id), response);

        this.storage.clear(this.getGroupByMemberTypeCacheKey(GroupMemberType.ADMIN.toString()));
        this.storage.clear(this.getAllGroupsCacheKey());

        if (clearChats) {
          this.eventService.refreshChatCache();
        }

        return response;
      }
    );
  }

  private getGroupCacheKey(groupId: number) {
    return 'GroupService_Group_' + groupId;
  }

  private getGroupByMemberTypeCacheKey(memberType: string) {
    return 'GroupService_GroupByMemberType_' + memberType;
  }

  private getAllGroupsCacheKey() {
    return 'GroupService_AllGroups';
  }

}
