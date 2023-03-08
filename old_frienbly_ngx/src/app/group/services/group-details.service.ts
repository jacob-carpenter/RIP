import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {AsyncSubject} from 'rxjs/AsyncSubject';

import {HttpRequest, HttpClient, HttpParams, HttpHeaders, HttpEvent, HttpResponse} from "@angular/common/http";
import {SessionStorageService} from 'ngx-webstorage';

import {GroupDetailsChangeListener} from './group-details.change.listener';

import {GroupDetails} from '../../common/contracts/group/models/group-details';

import {GroupService} from '../../common/services/groups/group.service';

import {environment} from '../../../environments/environment';

@Injectable()
export class GroupDetailsService {

  groupDetailsChangeListeners: GroupDetailsChangeListener[] = new Array<GroupDetailsChangeListener>();

  constructor(
    private httpClient: HttpClient,
    private storage: SessionStorageService,
    private groupService: GroupService
  ) { }

  public registerGroupDetailsChangeListener(groupDetailsChangeListener: GroupDetailsChangeListener) {
    this.groupDetailsChangeListeners.push(groupDetailsChangeListener);
  }

  public unregisterGroupDetailsChangeListener(groupDetailsChangeListener: GroupDetailsChangeListener) {
    var index = this.groupDetailsChangeListeners.indexOf(groupDetailsChangeListener, 0);
    if (index > -1) {
       this.groupDetailsChangeListeners.splice(index, 1);
    }
  }

  public areRequiredSettingsEntered(group: GroupDetails) {
    return group.imageId && group.groupTags.length >= 3;
  }

  public get(id: number) : Observable<GroupDetails> {
    var requestSubject = new AsyncSubject<GroupDetails>();
    var groupDetails = this.storage.retrieve(this.getGroupDetailsCacheKey(id)) as GroupDetails;
    if (groupDetails != null) {
      requestSubject.next(groupDetails);
      requestSubject.complete();
      return requestSubject;
    }

    this.httpClient.get(
      environment.apiUrl + '/api/group/details/' + id,
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    )
    .subscribe(
      (response: GroupDetails) => {
        this.storage.store(this.getGroupDetailsCacheKey(id), response);
        requestSubject.next(response);
        requestSubject.complete();
      }, (error) => {
        requestSubject.error(error);
        requestSubject.complete();
      }
    );

    return requestSubject;
  }

  public getById(groupId: number) : Observable<GroupDetails> {
    return this.getMultiple([groupId]).map(
      (response: GroupDetails[]) => response[0]
    )
  }

  public getMultiple(groupIds: number[]) : Observable<GroupDetails[]> {
    var requestedGroupIds: number[] = new Array<number>();
    var foundGroupDetails : GroupDetails[] = new Array<GroupDetails>();
    for (var index = 0; index < groupIds.length; index++) {
      var groupId = groupIds[index];

      var groupDetails = this.storage.retrieve(this.getGroupDetailsCacheKey(groupId)) as GroupDetails;

      if (groupDetails) {
        foundGroupDetails.push(groupDetails);
      } else {
        requestedGroupIds.push(groupId);
      }
    }

    var requestSubject = new AsyncSubject<GroupDetails[]>();
    if (requestedGroupIds.length == 0) {
        requestSubject.next(foundGroupDetails);
        requestSubject.complete();
        return requestSubject;
    }

    this.httpClient.post(
      environment.apiUrl + '/api/group/details/byIds',
      requestedGroupIds,
      {}
    ).subscribe(
      (response: GroupDetails[]) => {
        for (var index = 0; index < response.length; index++) {
          var groupDetails: GroupDetails = response[index];

          this.storage.store(this.getGroupDetailsCacheKey(groupDetails.id), groupDetails);

          foundGroupDetails.push(groupDetails);
        }

        requestSubject.next(foundGroupDetails);
        requestSubject.complete();
      },
      (error) => {
        requestSubject.error(error);
        requestSubject.complete();
      }
    )

    return requestSubject;
  }

  public save(groupDetails: GroupDetails) {
    return this.httpClient.post(
      environment.apiUrl + '/api/group/details',
      groupDetails,
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    )
    .map(
      (response: GroupDetails) => {
        this.storage.store(this.getGroupDetailsCacheKey(response.id), response);
        for (var index in this.groupDetailsChangeListeners) {
          this.groupDetailsChangeListeners[index].handleGroupDetailsChange(response);
        }

        this.groupService.updateCachedGroup(response);

        return response;
      }
    )
    .catch((response) => Observable.throw(response));
  }

  private getGroupDetailsCacheKey(groupId: number) {
    return 'GroupDetailsService_GroupDetails_' + groupId;
  }
}
