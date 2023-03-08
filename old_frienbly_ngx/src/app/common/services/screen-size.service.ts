import {Injectable} from '@angular/core';

@Injectable()
export class ScreenSizeService {
  isMobile() {
    return window.innerWidth < 601;
  }
}
