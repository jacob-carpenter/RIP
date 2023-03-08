import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { UUID } from 'angular2-uuid';
import { Ng2ImgToolsService } from 'ng2-img-tools';
import { EXIF } from 'exif-js';
import {Observable} from 'rxjs/Observable';
import {AsyncSubject} from 'rxjs/AsyncSubject';

import { Headers, Response } from '@angular/http';
import { UploadMetadata } from './before-upload.interface';

import { ScreenSizeService } from '../../../services/screen-size.service';
import { ImageService } from '../../../services/image.service';

import { ImageItem } from '../../../contracts/image/image.item';

export class FileHolder {
  public newFile: boolean = false;
  public pending: boolean = true;
  public errored: boolean = false;

  constructor(public imageId: string, public rotation: number, public src: string, public file: File) {
  }
}

@Component({
  selector: 'image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent implements OnInit, OnChanges {

  file: FileHolder;
  showFileTooLargeMessage: boolean = false;

  @Input() beforeUpload: (UploadMetadata) => UploadMetadata | Promise<UploadMetadata> = data => data;
  @Input() buttonCaption = 'Select Profile Image';
  @Input('class') cssClass = 'img-ul';
  @Input() dropBoxMessage = 'Drop your image here!';
  @Input() fileTooLargeMessage;
  @Input() maxFileHeight: number = 512;
  @Input() maxFileWidth: number = 512;
  @Input() maxFileSize: number = 4096000;
  @Input() preview = true;
  @Input() partName: string;
  @Input('extensions') supportedExtensions: string[];
  @Input() uploadedFile: { imageId: string, rotation: number };
  @Output() imageRemoved = new EventEmitter<FileHolder>();
  @Output() imageChanged = new EventEmitter<FileHolder>();

  private orientations = [
    { scale: {x: 1, y: 1}, rotate: 0 },
    { scale: {x: 1, y: 1}, rotate: 0 },
    { scale: {x: -1, y: 1}, rotate: 0 },
    { scale: {x: 1, y: 1}, rotate: 180 },
    { scale: {x: 1, y: -1}, rotate: 180 },
    { scale: {x: -1, y: 1}, rotate: 90 },
    { scale: {x: 1, y: 1}, rotate: 90 },
    { scale: {x: -1, y: 1}, rotate: 270 },
    { scale: {x: 1, y: 1}, rotate: 270 }
  ];

  @ViewChild('input')
  private inputElement: ElementRef;

  constructor(private imageService: ImageService, private ng2ImgToolsService: Ng2ImgToolsService, private screenSizeService: ScreenSizeService) {
  }

  ngOnInit() {
    if (!this.fileTooLargeMessage) {
      this.fileTooLargeMessage = 'An image was too large and was not uploaded.' + (this.maxFileSize ? (' The maximum file size is ' + this.maxFileSize / 1024) + 'KiB.' : '');
    }
    this.supportedExtensions = this.supportedExtensions ? this.supportedExtensions.map((ext) => 'image/' + ext) : ['image/*'];
  }

  deleteFile(file: FileHolder): void {
    this.file = null;
    this.inputElement.nativeElement.value = '';
    this.imageRemoved.emit(file);
  }

  ngOnChanges(changes) {
    if (changes.uploadedFile) {
      this.processUploadedFiles();
    }
  }

  onFileChange(files: FileList) {
    this.showFileTooLargeMessage = false;
    this.uploadFiles(files);
  }

  private processUploadedFiles() {
    if (this.uploadedFile) {
      // Load Image

      var fileHolder = new FileHolder(this.uploadedFile.imageId, this.uploadedFile.rotation, null, null);
      fileHolder.pending = true;
      this.file = fileHolder;

      this.imageService.get(this.uploadedFile.imageId).subscribe(
        (image: ImageItem) => {
          fileHolder.src = 'data:image/jpeg;base64,' + image.image;
          fileHolder.pending = false;
        },
        (error) => {
          console.log(error);
          fileHolder.pending = false;
          fileHolder.errored = true;
        }
      );
    }
  }

  private async uploadFiles(files: FileList) {
    if (!files || files.length < 1) {
      return;
    }

    var tempFileHolder = new FileHolder(null, 0, null, null);
    tempFileHolder.pending = true;
    this.file = tempFileHolder;

    var file = files[0];

    var requestSubject = new AsyncSubject<ArrayBuffer>();
    const fileReader = new FileReader();
    fileReader.addEventListener('load', (event: any) => {
      requestSubject.next(event.target.result);
      requestSubject.complete();
    });
    fileReader.readAsArrayBuffer(file)

    var fileContents = await requestSubject.toPromise();

    var imageRequestSubject = new AsyncSubject<any>();
    var blob = new Blob( [ fileContents ], { type: "image/jpeg" } );
    var image = new Image();
    image.src = window.URL.createObjectURL( blob );
    image.onload = function() {
        imageRequestSubject.next(image);
        imageRequestSubject.complete();
    };

    await imageRequestSubject.toPromise();
    var aspectWidth = image.width / image.height;

    var exif = EXIF.readFromBinaryFile(fileContents);
    var val = exif.Orientation || 0;
    var orientation = this.orientations[val];
    if (orientation && (orientation.rotate == 90 || orientation.rotate == 270)) {
      file = await this.ng2ImgToolsService.resize([file], this.maxFileHeight, this.maxFileWidth * aspectWidth).first().toPromise();
    } else {
      file = await this.ng2ImgToolsService.resize([file], this.maxFileWidth * aspectWidth, this.maxFileHeight).first().toPromise();
    }


    if (this.maxFileSize && file.size > this.maxFileSize) {
      this.inputElement.nativeElement.value = '';
      this.showFileTooLargeMessage = true;
      return;
    }


    const beforeUploadResult: UploadMetadata = await this.beforeUpload({ file, imageId: UUID.UUID(), abort: false });

    if (beforeUploadResult.abort) {
      this.inputElement.nativeElement.value = '';
      return;
    }

    const img = document.createElement('img');
    img.src = window.URL.createObjectURL(beforeUploadResult.file);

    const reader = new FileReader();
    reader.addEventListener('load', (event: any) => {
      const fileHolder: FileHolder = new FileHolder(beforeUploadResult.imageId, this.screenSizeService.isMobile() ? orientation.rotate : 0, event.target.result, beforeUploadResult.file);
      fileHolder.pending = false;
      this.uploadSingleFile(fileHolder);
      this.file = fileHolder;
    }, false);
    reader.readAsDataURL(beforeUploadResult.file);
  }

  private getFileExtension(filename: string) : string {
    if (filename != null) {
      return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
    }
    return '';
  }

  private uploadSingleFile(fileHolder: FileHolder) {
    fileHolder.newFile = true;

    this.imageChanged.emit(fileHolder);
  }

  public rotateLeft(file: FileHolder) {
    file.rotation = file.rotation -= 90;

    if (file.rotation == -360) {
      file.rotation = 0;
    }

    this.imageChanged.emit(file);
  }

  public rotateRight(file: FileHolder) {
    file.rotation = file.rotation += 90;

    if (file.rotation == 360) {
      file.rotation = 0;
    }

    this.imageChanged.emit(file);
  }
}
