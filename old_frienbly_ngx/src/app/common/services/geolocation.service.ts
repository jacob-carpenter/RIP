import {Injectable} from '@angular/core';

import {HttpRequest, HttpClient, HttpParams, HttpHeaders, HttpEvent, HttpResponse} from "@angular/common/http";

import {Observable} from 'rxjs/Observable';
import {AsyncSubject} from 'rxjs/AsyncSubject';

import {LocalStorageService} from 'ngx-webstorage';

import {StreetLocation} from '../contracts/geolocation/street-location';

import {environment} from '../../../environments/environment';

@Injectable()
export class GeolocationService {
  private currentGeolocationPosition: Position;
  private currentStreetLocation: StreetLocation;

  constructor(private httpClient: HttpClient, private storage: LocalStorageService) {}

  public getCurrentStreetLocation() : Observable<StreetLocation> {
    var requestSubject = new AsyncSubject<StreetLocation>();

    if (this.currentStreetLocation != null) {
      requestSubject.next(this.currentStreetLocation);
      requestSubject.complete();
      return requestSubject;
    }

    this.getCurrentGeolocation().subscribe(
      (position: Position) => {
        var streetLocation: StreetLocation = new StreetLocation();
        this.currentStreetLocation = streetLocation;
        this.currentStreetLocation.latitude = position.coords.latitude;
        this.currentStreetLocation.longitude = position.coords.longitude;

        var params = new HttpParams()
          .append('latlng', position.coords.latitude + ',' + position.coords.longitude)
          .append('key', environment.googleApis.mapGeocodingApi.key);

        this.httpClient.get(
          environment.googleApis.mapGeocodingApi.url,
          {
            params: params
          }
        ).subscribe(
          (googleResponse: any) => {
            if (googleResponse && googleResponse.results && googleResponse.results.length > 0) {
              var result = googleResponse.results[0];

              if (result.address_components && result.address_components.length > 0 && result.types && result.types.indexOf('street_address') >= 0) {
                var street_number: string;
                var route: string;
                var locality: string;
                var administrative_area_level_1: string;
                var country: string;
                var postal_code: number;

                for (var componentIndex in result.address_components) {
                  var component = result.address_components[componentIndex];

                  if (component.types && component.types.indexOf('street_number') >= 0) {
                    street_number = component.long_name;
                  } else if (component.types && component.types.indexOf('route') >= 0) {
                    route = component.long_name;
                  } else if (component.types && component.types.indexOf('locality') >= 0) {
                    locality = component.long_name;
                  } else if (component.types && component.types.indexOf('administrative_area_level_1') >= 0) {
                    administrative_area_level_1 = component.long_name;
                  } else if (component.types && component.types.indexOf('country') >= 0) {
                    country = component.long_name;
                  } else if (component.types && component.types.indexOf('postal_code') >= 0) {
                    postal_code = component.long_name as number;
                  }
                }

                streetLocation.street = street_number + ' ' + route;
                streetLocation.city = locality;
                streetLocation.province = administrative_area_level_1;
                streetLocation.country = country;
                streetLocation.postalCode = postal_code;
              }
            }

            requestSubject.next(streetLocation);
            requestSubject.complete();
          },
          (error) => {
            console.log(error);
            requestSubject.next(streetLocation);
            requestSubject.complete();
          }
        );
      },
      (error) => {
        requestSubject.error(error);
        requestSubject.complete();
      }
    )

    return requestSubject;
  }

  public getGeolocationDetails(initialStreetLocation: StreetLocation) : Observable<StreetLocation> {
    var requestSubject = new AsyncSubject<StreetLocation>();

    var cacheKey = this.getGeolocationDetailsCacheKey(initialStreetLocation);
    var location = this.storage.retrieve(cacheKey) as StreetLocation;
    if (location) {
      requestSubject.next(location);
      requestSubject.complete();
      return requestSubject;
    }

    var params = new HttpParams()
      .append('address', (initialStreetLocation.street ? initialStreetLocation.street + ', ' : '') + initialStreetLocation.city + ', ' + initialStreetLocation.province + ', ' + initialStreetLocation.postalCode + ', ' + initialStreetLocation.country)
      .append('key', environment.googleApis.mapGeocodingApi.key);

    this.httpClient.get(
      environment.googleApis.mapGeocodingApi.url,
      {
        params: params
      }
    ).subscribe(
      (googleResponse: any) => {
        if (googleResponse && googleResponse.results && googleResponse.results.length > 0) {
          for (var index in googleResponse.results) {
            var result = googleResponse.results[index];

            if (result.geometry && result.geometry.location) {
              initialStreetLocation.latitude = result.geometry.location.lat;
              initialStreetLocation.longitude = result.geometry.location.lng;
            }
          }
        }

        this.storage.store(cacheKey, initialStreetLocation);
        requestSubject.next(initialStreetLocation);
        requestSubject.complete();
      },
      (error) => {
        console.log(error);
        requestSubject.error(error);
        requestSubject.complete();
      }
    );

    return requestSubject;
  }
  private getGeolocationDetailsCacheKey(streetLocation: StreetLocation) : string {
    return 'GeolocationService_getGeolocationDetails_' + this.getStreetLocationCacheKey(streetLocation);
  }
  private getStreetLocationCacheKey(streetLocation: StreetLocation) {
    return (streetLocation.street ? streetLocation.street : '') + streetLocation.city + streetLocation.province + streetLocation.postalCode + streetLocation.country;
  }

  public getCurrentGeolocation() : Observable<Position> {
    var requestSubject = new AsyncSubject<Position>();
    if (this.currentGeolocationPosition != null) {
      requestSubject.next(this.currentGeolocationPosition);
      requestSubject.complete();
      return requestSubject;
    }

    navigator.geolocation.getCurrentPosition(
      (location: Position) => {
        this.currentGeolocationPosition = location;

        requestSubject.next(location);
        requestSubject.complete();
      },
      (error) => {
        requestSubject.error(error);
        requestSubject.complete();
      }
    );

    return requestSubject;
  }
}
