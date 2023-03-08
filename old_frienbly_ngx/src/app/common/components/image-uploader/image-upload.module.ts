import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { MatCardModule } from '@angular/material';
import { MatProgressSpinnerModule } from '@angular/material';
import { Ng2ImgToolsModule } from 'ng2-img-tools';

import { FileDropDirective } from './file-drop.directive';
import { ImageUploadComponent } from './image-upload/image-upload.component';
import { ImageService } from '../../services/image.service';

@NgModule({
  imports: [CommonModule, HttpModule, MatCardModule, MatProgressSpinnerModule, Ng2ImgToolsModule],
  declarations: [ImageUploadComponent, FileDropDirective],
  exports: [ImageUploadComponent]
})
export class ImageUploadModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ImageUploadModule,
      providers: [ImageService]
    }
  }
}
