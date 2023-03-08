import {Component, HostListener, OnInit, OnDestroy, Output, EventEmitter} from '@angular/core';
import { Router, Routes, Route, NavigationEnd } from '@angular/router';

import {MenuType} from '../menu-type';

import {UserService} from '../../services/user.service';
import {ScreenSizeService} from '../../services/screen-size.service'
import {MessengerService} from '../../services/messenger.service';
import {EventSettingsService} from '../../services/events/event-settings.service';

import {RouteProvider} from '../../../routes/route.provider';

@Component({
  selector: 'app-top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.scss']
})
export class TopMenuComponent implements OnInit, OnDestroy {
  public hasChats: boolean = false;
  public hasEvents: boolean = false;

  MenuType = MenuType;

  @Output()
  private leftMenuToggled: EventEmitter<any> = new EventEmitter();

  homeRoutePath: string = RouteProvider.getHomeRoute().path;
  selectedMenuType: MenuType = MenuType.SEARCH;
  isMobile: boolean = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private screenSizeService: ScreenSizeService,
    private eventSettingsService: EventSettingsService,
    private messengerService: MessengerService
  ) {

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd ) {
        if (this.router.url.indexOf('/' + RouteProvider.getMessengerRoute().path) == 0) {
          this.selectedMenuType = MenuType.MESSENGER;
        } else if (this.router.url.indexOf('/' + RouteProvider.getEventRoute().path) == 0) {
          this.selectedMenuType = MenuType.EVENTS;
        } else {
          this.selectedMenuType = MenuType.SEARCH;
        }
      }
    });
  }

  public ngOnInit() {
    this.messengerService.addHasChatsCallback(this.hasChatsUpdated.bind(this));
    if (this.userService.getCurrentUserToken()) {
      this.messengerService.hasChats().subscribe((hasChats) => {
        this.hasChats = hasChats;
      });

      this.eventSettingsService.get().subscribe((response) => {
        this.hasEvents = response.length > 0;
      });
    }

    this.calculateMobileState();
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.calculateMobileState();
  }

  public ngOnDestroy() {
    this.messengerService.removeHasChatsCallback(this.hasChatsUpdated.bind(this));
  }

  public hasChatsUpdated = (hasChats: boolean) => {
    this.hasChats = hasChats;
  }

  public calculateMobileState() {
    this.isMobile = this.screenSizeService.isMobile();
  }

  public isUserLoggedIn() {
    return this.userService.getCurrentUserToken() != null;
  }

  public toggleLeftMenu() {
    this.leftMenuToggled.emit({});
  }
}
