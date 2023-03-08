import {Injectable, Component, HostListener, OnInit} from '@angular/core';

import {ScreenSizeService} from '../common/services/screen-size.service'

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss']
})
@Injectable()
export class DashboardComponent {
  private screenSizeService: ScreenSizeService;

  isMobile: boolean = false;
  isLeftMenuExpanded: boolean = false;

  constructor(screenSizeService: ScreenSizeService) {
    this.screenSizeService = screenSizeService;
  }

  ngOnInit() {
    this.calculateMobileState()
  }
  @HostListener('window:resize', ['$event'])
    onResize(event) {
       this.calculateMobileState()
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
