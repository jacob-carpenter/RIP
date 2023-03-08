import {Injectable, Component, HostListener, OnInit, OnDestroy, Input, ViewChild, ElementRef} from '@angular/core';

import {ScreenSizeService} from '../../common/services/screen-size.service';

declare let gtag: Function;

@Component({
  selector: 'event-viewport',
  templateUrl: './event-viewport.component.html',
  styleUrls: ['./event-viewport.component.scss']
})
export class EventViewportComponent {
  public isMobile: boolean = false;
  public isLeftMenuExpanded: boolean = false;

  constructor(
    private screenSizeService: ScreenSizeService
  ) {}

  public ngOnInit() {
    this.calculateMobileState();
  }

  @HostListener('window:resize', ['$event'])
    onResize(event) {
       this.calculateMobileState();
  }

  calculateMobileState() {
    var calculatedMobileState = this.screenSizeService.isMobile();
    if (calculatedMobileState != this.isMobile) {
      this.isLeftMenuExpanded = false;
      this.isMobile = calculatedMobileState;
    }
  }

  leftMenuToggled() {
    this.isLeftMenuExpanded = !this.isLeftMenuExpanded;
  }

}
