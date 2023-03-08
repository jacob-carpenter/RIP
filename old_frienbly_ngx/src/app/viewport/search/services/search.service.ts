import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {AsyncSubject} from 'rxjs/AsyncSubject';

import {HttpRequest, HttpClient, HttpParams, HttpHeaders, HttpEvent, HttpResponse} from "@angular/common/http";

import {FilterCriteria} from '../../../common/contracts/search/filter/filter-criteria';

import {SearchResult} from '../../../common/contracts/search/search-result';

import {environment} from '../../../../environments/environment';

@Injectable()
export class SearchService {

  constructor(private httpClient: HttpClient) {}

  public runReport(filterCriteria : FilterCriteria) : Observable<SearchResult[]> {
    return this.httpClient.post(
      environment.apiUrl + '/api/search',
      filterCriteria,
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    ).map((response: SearchResult[]) => { return response; });
  }
}
