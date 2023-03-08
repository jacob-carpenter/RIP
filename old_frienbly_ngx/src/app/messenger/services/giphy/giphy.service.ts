import { Injectable } from '@angular/core';

import {Observable} from 'rxjs/Observable';
import {HttpRequest, HttpClient, HttpParams, HttpHeaders, HttpEvent, HttpResponse} from "@angular/common/http";

import {environment} from '../../../../environments/environment';

@Injectable()
export class GiphyService {

  constructor(private httpClient: HttpClient) {}

  public getGiphyLink(textSearch: string) : Observable<{url:string, height:number}> {
    return this.httpClient.get(
      environment.giphy.url + environment.giphy.api_key + '&q=' + textSearch + '&limit=25&offset=0&rating=' + environment.giphy.mpaa_rating + '&lang=en'
    ).map(
      (giphyResponse: any) => {
        if (giphyResponse && giphyResponse.data) {
          var downsized =  giphyResponse.data[Math.floor(Math.random() * giphyResponse.data.length)].images.downsized;

          return {url: downsized.url, height: downsized.height};
        }

        return null;
      }
    );
  }

  public isGiphyTextEntry(text: string) : boolean {
    if (text) {
      return text.trim().indexOf('/giphy ') == 0;
    }

    return false;
  }

  public getGiphySearchString(text: string) : string {
    if (text && text.trim().indexOf('/giphy ') == 0) {
      return text.trim().substring(7, text.length);
    }

    return null;
  }

}
