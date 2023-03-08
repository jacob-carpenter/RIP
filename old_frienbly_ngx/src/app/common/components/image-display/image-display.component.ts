import {Component, Input, OnInit} from '@angular/core';

import {ImageItem} from '../../contracts/image/image.item';
import {ImageService} from '../../services/image.service';

@Component({
  selector: 'image-display',
  templateUrl: './image-display.component.html',
  styleUrls: ['./image-display.component.scss']
})
export class ImageDisplayComponent implements OnInit {

  loading: boolean = false;
  imageSrc: string;

  @Input()
  imageId: string;

  @Input()
  rotation: number;

  @Input()
  defaultIcon: string = 'account_circle';

  @Input()
  defaultIconSize: string = '140px';

  @Input()
  maxHeight: string = '125px';

  @Input()
  inline: boolean = false;

  public constructor(private imageService: ImageService) {

  }

  public ngOnInit() {
    if (this.imageId) {
      this.imageService.get(this.imageId).subscribe(
        (response: ImageItem) => {
          this.imageSrc = 'data:image/jpeg;base64,' + response.image;
        },
        (error) => {
          console.debug(error);
        }
      );
    }
  }
}
