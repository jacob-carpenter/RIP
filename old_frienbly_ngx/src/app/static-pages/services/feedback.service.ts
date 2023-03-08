import {Injectable} from '@angular/core';

import {HttpClient, HttpRequest, HttpEvent, HttpResponse, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {AsyncSubject} from 'rxjs/AsyncSubject';

import {SessionStorageService} from 'ngx-webstorage';

import {environment} from '../../../environments/environment';

import {Feedback} from '../../common/contracts/feedback/feedback';

@Injectable()
export class FeedbackService {
  public constructor(
    private httpClient: HttpClient
  ) {  }

  public sendFeedback(feedback: Feedback) : Observable<any> {
    return this.httpClient.post(
      environment.apiUrl + '/api/feedback',
      feedback,
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    );
  }

}
