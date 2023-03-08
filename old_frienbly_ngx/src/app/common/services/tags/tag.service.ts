import {Injectable, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {AsyncSubject} from 'rxjs/AsyncSubject';

import {SessionStorageService} from 'ngx-webstorage';

import {HttpRequest, HttpClient, HttpParams, HttpHeaders, HttpEvent, HttpResponse} from "@angular/common/http";

import {UserDetails} from '../../contracts/user/models/user-details';
import {GroupDetails} from '../../contracts/group/models/group-details';

import {TagCount} from '../../contracts/tags/tag.count';
import {UserTag} from '../../contracts/user/models/user-tag';
import {GroupTag} from '../../contracts/group/models/group-tag';
import {Tag, ViewableTag} from '../../contracts/tags/tag';
import {TagType} from '../../contracts/tags/tag.type';

import {environment} from '../../../../environments/environment';

@Injectable()
export class TagService {
  constructor(
    private httpClient: HttpClient,
    private storage: SessionStorageService
  ) { }

  public getTopUsed(search: string) : Observable<TagCount[]> {
    if (!search) {
      search = '';
    }

    if (search.length > 1) {
      search = search.substring(0, 1);
    }

    var storageKey = 'TagService_getTopUsed_' + search;
    var cachedTagCounts = this.storage.retrieve(storageKey) as TagCount[];

    var requestSubject = new AsyncSubject<TagCount[]>();
    if (cachedTagCounts) {
        requestSubject.next(cachedTagCounts);
        requestSubject.complete();
        return requestSubject;
    }

    return this.httpClient.get(
      environment.apiUrl + '/api/tags/topused?search=' + search,
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    ).map((response: TagCount[]) => {
      this.storage.store(storageKey, response);

      return response;
    });
  }

  public saveCurrentUserTags(tags: UserTag[]) : Observable<UserTag[]> {
    return this.httpClient.post(
      environment.apiUrl + '/api/tags/user',
      tags,
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    ).map((response: UserTag[]) => response);
  }

  public saveCurrentGroupTags(groupId: number, tags: GroupTag[]) : Observable<GroupTag[]> {
    return this.httpClient.post(
      environment.apiUrl + '/api/tags/group/' + groupId,
      tags,
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    ).map((response: GroupTag[]) => response);
  }




    // User Tag Utility
    public populateUserTagsFromDetails(tagType: TagType, userDetails: UserDetails) : ViewableTag[] {
      var userViewableTags = new Array<ViewableTag>();

      for (var index = 0; index < userDetails.userTags.length; index++) {
        var userTag = userDetails.userTags[index];
        if (userTag.tagType == tagType) {
          userViewableTags.push(new ViewableTag(userTag.tag.display, userTag.tag.display));
        }
      }

      return userViewableTags;
    }

    public cleanTagText(display: string) : string {
      return display.toLowerCase().trim();
    }

    public addTag(tagType: TagType, event: ViewableTag, userDetails: UserDetails) {
      for (var tagIndex = 0; tagIndex < userDetails.userTags.length; tagIndex++) {
        var userTag = userDetails.userTags[tagIndex];

        if (userTag.tagType == tagType && (userTag.tag == event.value || userTag.tag.display == event.display)) {
          return;
        }
      }

      var addedTag: Tag  = new Tag();
      addedTag.display = this.cleanTagText(event.display);

      var userTag = new UserTag();
      userTag.tag = addedTag;
      userTag.tagType = tagType;

      userDetails.userTags.push(userTag);
    }

    public removeTag(tagType: TagType, event: ViewableTag, userDetails: UserDetails) {
      for (var tagIndex = 0; tagIndex < userDetails.userTags.length; tagIndex++) {
        var userTag = userDetails.userTags[tagIndex];

        if (userTag.tagType == tagType && (userTag.tag == event.value || userTag.tag.display == event.display)) {
          userDetails.userTags.splice(tagIndex, 1);
        }
      }
    }

    public addTags(affectedTagType: TagType, copyFromTagType: TagType, userDetails: UserDetails) {
      var tagsToAdd: Array<ViewableTag> = [];

      for (var tagIndex = 0; tagIndex < userDetails.userTags.length; tagIndex++) {
        var userTag = userDetails.userTags[tagIndex];

        if (userTag && userTag.tag && userTag.tagType == copyFromTagType && userTag.tag.display) {
          tagsToAdd.push(new ViewableTag(userTag.tag.display, userTag.tag.display));
        }
      }

      for (var tagIndex = 0; tagIndex < tagsToAdd.length; tagIndex++) {
        this.addTag(affectedTagType, tagsToAdd[tagIndex], userDetails);
      }
    }

    public clearTags(tagType: TagType, userDetails: UserDetails) {
      var tagsToRemove: Array<ViewableTag> = [];

      for (var tagIndex = 0; tagIndex < userDetails.userTags.length; tagIndex++) {
        var userTag = userDetails.userTags[tagIndex];

        if (userTag.tagType == tagType) {
          tagsToRemove.push(new ViewableTag(userTag.tag.display, userTag.tag.display));
        }
      }

      for (var tagIndex = 0; tagIndex < tagsToRemove.length; tagIndex++) {
        this.removeTag(tagType, tagsToRemove[tagIndex], userDetails);
      }
    }



    // Group Tag Utility
    public populateGroupTagsFromDetails(tagType: TagType, groupDetails: GroupDetails) : ViewableTag[] {
      var groupViewableTags = new Array<ViewableTag>();

      for (var index = 0; index < groupDetails.groupTags.length; index++) {
        var groupTag = groupDetails.groupTags[index];
        if (groupTag.tagType == tagType) {
          groupViewableTags.push(new ViewableTag(groupTag.tag.display, groupTag.tag.display));
        }
      }

      return groupViewableTags;
    }

    public addGroupTag(tagType: TagType, event: ViewableTag, groupDetails: GroupDetails) {
      for (var tagIndex = 0; tagIndex < groupDetails.groupTags.length; tagIndex++) {
        var groupTag = groupDetails.groupTags[tagIndex];

        if (groupTag.tagType == tagType && (groupTag.tag == event.value || groupTag.tag.display == event.display)) {
          return;
        }
      }

      var addedTag: Tag  = new Tag();
      addedTag.display = this.cleanTagText(event.display);

      var groupTag = new GroupTag();
      groupTag.tag = addedTag;
      groupTag.tagType = tagType;

      groupDetails.groupTags.push(groupTag);
    }

    public removeGroupTag(tagType: TagType, event: ViewableTag, groupDetails: GroupDetails) {
      for (var tagIndex = 0; tagIndex < groupDetails.groupTags.length; tagIndex++) {
        var groupTag = groupDetails.groupTags[tagIndex];

        if (groupTag.tagType == tagType && (groupTag.tag == event.value || groupTag.tag.display == event.display)) {
          groupDetails.groupTags.splice(tagIndex, 1);
        }
      }
    }

    public addGroupTags(affectedTagType: TagType, copyFromTagType: TagType, groupDetails: GroupDetails) {
      var tagsToAdd: Array<ViewableTag> = [];

      for (var tagIndex = 0; tagIndex < groupDetails.groupTags.length; tagIndex++) {
        var userTag = groupDetails.groupTags[tagIndex];

        if (userTag && userTag.tag && userTag.tagType == copyFromTagType && userTag.tag.display) {
          tagsToAdd.push(new ViewableTag(userTag.tag.display, userTag.tag.display));
        }
      }

      for (var tagIndex = 0; tagIndex < tagsToAdd.length; tagIndex++) {
        this.addGroupTag(affectedTagType, tagsToAdd[tagIndex], groupDetails);
      }
    }

    public clearGroupTags(tagType: TagType, groupDetails: GroupDetails) {
      var tagsToRemove: Array<ViewableTag> = [];

      for (var tagIndex = 0; tagIndex < groupDetails.groupTags.length; tagIndex++) {
        var groupTag = groupDetails.groupTags[tagIndex];

        if (groupTag.tagType == tagType) {
          tagsToRemove.push(new ViewableTag(groupTag.tag.display, groupTag.tag.display));
        }
      }

      for (var tagIndex = 0; tagIndex < tagsToRemove.length; tagIndex++) {
        this.removeGroupTag(tagType, tagsToRemove[tagIndex], groupDetails);
      }
    }
}
