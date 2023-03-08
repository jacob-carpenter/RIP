import {Injectable} from '@angular/core';

import {HttpClient, HttpRequest, HttpEvent, HttpResponse, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {AsyncSubject} from 'rxjs/AsyncSubject';

import {SessionStorageService} from 'ngx-webstorage';

import {environment} from '../../../environments/environment';

import {BlockService} from '../../common/services/block.service';

@Injectable()
export class ReportService {
  public constructor(
    private storage: SessionStorageService,
    private httpClient: HttpClient,
    private blockService: BlockService
  ) {}

  public reportUser(userId: number, reason: string) : Observable<any> {
    return this.httpClient.post(
      environment.apiUrl + '/api/user/report/' + userId,
      reason,
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    )
    .map(
      (response) => {
        var blockedIds = this.storage.retrieve(this.blockService.getBlockedUserIdsCacheKey()) as number[];
        if (blockedIds) {
          blockedIds.push(userId);
        }
      }, (error) => {}
    );
  }

}
