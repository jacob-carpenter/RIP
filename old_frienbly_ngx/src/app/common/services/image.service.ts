import {Injectable} from '@angular/core';

import {HttpClient, HttpRequest, HttpEvent, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {AsyncSubject} from 'rxjs/AsyncSubject';

import {LocalStorageService} from 'ngx-webstorage';

import {ImageRetrievalRequest} from '../contracts/image/requests/image-retrieval.request';
import {ImageReply} from '../contracts/image/replies/image.reply';
import {ImageItem} from '../contracts/image/image.item';

import {environment} from '../../../environments/environment';

@Injectable()
export class ImageService {

  constructor(private storage: LocalStorageService, private http: HttpClient) {
  }

  public getMultiple(imageIds: string[]) : Observable<ImageItem[]> {
    var requestedImageIds: string[] = new Array<string>();
    var foundImageItems : ImageItem[] = new Array<ImageItem>();
    for (var index = 0; index < imageIds.length; index++) {
      var imageId = imageIds[index];

      var cachedImage = this.storage.retrieve(this.getImageKey(imageId)) as ImageItem;

      if (cachedImage) {
        foundImageItems.push(cachedImage);
      } else {
        requestedImageIds.push(imageId);
      }
    }

    var requestSubject = new AsyncSubject<ImageItem[]>();
    if (requestedImageIds.length == 0) {
        requestSubject.next(foundImageItems);
        requestSubject.complete();
        return requestSubject;
    }

    var request = new ImageRetrievalRequest();
    request.imageIds = requestedImageIds;
    this.http.post(
      environment.apiUrl + '/api/image',
      request,
      {}
    ).subscribe(
      (response: ImageReply) => {
        for (var imageIndex = 0; imageIndex < response.images.length; imageIndex++) {
          var image: ImageItem = response.images[imageIndex];

          try {
            this.storage.store(this.getImageKey(image.imageId), image);
          } catch (e) {
            console.log("Local Storage is full, please empty data.");
          }

          foundImageItems.push(image);
        }

        requestSubject.next(foundImageItems);
        requestSubject.complete();
      },
      (error) => {
        requestSubject.error(error);
        requestSubject.complete();
      }
    )

    return requestSubject;
  }

  public get(imageId: string) : Observable<ImageItem> {
    return this.getMultiple([imageId]).map(
      (response: ImageItem[]) => response[0]
    )
  }

  public delete(imageId: string) : Observable<{}> {
    this.storage.clear(this.getImageKey(imageId));
    return this.http.delete(
      environment.apiUrl + '/api/image/' + imageId,
      {}
    );
  }

  public upload(imageId: string, image: File, partName: string = 'image'): Observable<{}> {
    let formData = new FormData();
    formData.append(partName, image);
    return this.http.post(
      environment.apiUrl + '/api/image/' + imageId,
      formData,
      {}
    );
  }

  private getImageKey(imageId: string) {
    return 'ImageService_' + imageId;
  }
}
