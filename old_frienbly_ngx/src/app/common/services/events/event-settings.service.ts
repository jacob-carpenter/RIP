import {Injectable, OnInit, OnDestroy} from '@angular/core';
import {Router, Routes, Route, NavigationEnd, ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {AsyncSubject} from 'rxjs/AsyncSubject';

import {SessionStorageService} from 'ngx-webstorage';

import {HttpRequest, HttpClient, HttpParams, HttpHeaders, HttpEvent, HttpResponse} from "@angular/common/http";

import {RouteProvider} from '../../../routes/route.provider';

import {Message} from '../../../common/contracts/chat/messages/message';
import {Event} from '../../../common/contracts/event/event';
import {EventRsvp} from '../../../common/contracts/event/event-rsvp';

import {MessengerService} from '../messenger.service';

import {environment} from '../../../../environments/environment';

@Injectable()
export class EventSettingsService implements OnInit, OnDestroy {
  public showDeclined: boolean = false;
  private selectedEvent: Event;

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private storage: SessionStorageService,
    private messengerService: MessengerService
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd ) {
        if (this.router.url.indexOf('/' + RouteProvider.getEventRoute().path) < 0) {
          this.setSelectedEvent(null);
        }
      }
    });

    this.ngOnInit();
  }

  public ngOnInit() {
    this.messengerService.addEventRsvpCallback(this.eventRsvpUpdated.bind(this));
  }

  public ngOnDestroy() {
    this.messengerService.removeEventRsvpCallback(this.eventRsvpUpdated.bind(this));
  }

  public eventRsvpUpdated = (eventRsvp: EventRsvp) => {
    var event = this.storage.retrieve(this.getEventCacheKey(eventRsvp.eventId)) as Event;
    if (event) {
      var found = false;
      for (var index = 0; index < event.eventRsvps.length; index++) {
        var foundEventRsvp = event.eventRsvps[index];
        if (foundEventRsvp.userId == eventRsvp.userId) {
          foundEventRsvp.rsvpStatusType = eventRsvp.rsvpStatusType;
          foundEventRsvp.rsvpSentTime = eventRsvp.rsvpSentTime;

          found = true;
        }
      }

      if (!found) {
        event.eventRsvps.push(eventRsvp);
      }

      this.notifyEventUpdateListeners(event);
    }
  }


  public setSelectedEvent(event: Event) {
    this.selectedEvent = event;
  }

  public getSelectedEvent() : Event {
    return this.selectedEvent;
  }

  public get() : Observable<Event[]> {
    var requestSubject = new AsyncSubject<Event[]>();
    var events = this.storage.retrieve(this.getAllEventCacheKey()) as Event[];
    if (events) {
      requestSubject.next(events);
      requestSubject.complete();
      return requestSubject;
    }

    this.httpClient.get(
      environment.apiUrl + '/api/event',
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    )
    .subscribe((response: Event[]) => {
        this.storage.store(this.getAllEventCacheKey(), response);
        for (var index = 0; index < response.length; index++) {
          var event = response[index];

          this.storage.store(this.getEventCacheKey(event.eventId), event);
        }
        requestSubject.next(response);
        requestSubject.complete();
      }
    );

    return requestSubject;
  }
  public getAllEventCacheKey() {
    return 'EventService_getAllEventCacheKey';
  }

  public getById(eventId: number) : Observable<Event> {
    var requestSubject = new AsyncSubject<Event>();
    var event = this.storage.retrieve(this.getEventCacheKey(eventId)) as Event;
    if (event) {
      requestSubject.next(event);
      requestSubject.complete();
      return requestSubject;
    }

    this.httpClient.get(
      environment.apiUrl + '/api/event/' + eventId,
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    )
    .subscribe((response: Event) => {
        this.storage.store(this.getEventCacheKey(eventId), response);

        requestSubject.next(response);
        requestSubject.complete();
      }
    );

    return requestSubject;
  }
  public getByIds(eventIds: number[]) : Observable<Event[]> {
    var requestedEventIds: number[] = new Array<number>();
    var foundEvents : Event[] = new Array<Event>();
    for (var index = 0; index < eventIds.length; index++) {
      var eventId = eventIds[index];

      var cachedEvent = this.storage.retrieve(this.getEventCacheKey(eventId)) as Event;

      if (cachedEvent) {
        foundEvents.push(cachedEvent);
      } else {
        requestedEventIds.push(eventId);
      }
    }

    var requestSubject = new AsyncSubject<Event[]>();
    if (requestedEventIds.length == 0) {
        requestSubject.next(foundEvents);
        requestSubject.complete();
        return requestSubject;
    }

    this.httpClient.post(
      environment.apiUrl + '/api/event/getByIds',
      requestedEventIds,
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    )
    .subscribe((response: Event[]) => {
        for (var index = 0; index < response.length; index++) {
          this.storage.store(this.getEventCacheKey(response[index].eventId), response[index]);
          foundEvents.push(response[index]);
        }

        requestSubject.next(foundEvents);
        requestSubject.complete();
      }
    );

    return requestSubject;
  }
  public getEventCacheKey(eventId: number) {
    return 'EventService_getById_' + eventId;
  }

  public save(event: Event) : Observable<Event> {
    var newEvent = !event.eventId;

    var requestSubject = new AsyncSubject<Event>();
    this.httpClient.post(
      environment.apiUrl + '/api/event',
      event,
      {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    )
    .subscribe((response: Event) => {
        this.storage.store(this.getEventCacheKey(response.eventId), response);

        var events = this.storage.retrieve(this.getAllEventCacheKey()) as Event[];
        if (events) {
          var found = false;
          for (var index = 0; index < events.length; index++) {
            var event = events[index];
            if (event.eventId == response.eventId) {
              events[index] = response;
              found = true;
            }
          }

          if (!found) {
            events.push(response);
          }
        }

        if (newEvent) {
          var messageContainer = new Message();
          messageContainer.chatId = response.targettedChatId;
          messageContainer.eventId = response.eventId;

          this.messengerService.send('message', messageContainer);
        }

        this.notifyEventUpdateListeners(response);

        requestSubject.next(response);
        requestSubject.complete();
      }
    );

    return requestSubject;
  }

  public sendRsvp(eventRsvp: EventRsvp) {
    this.messengerService.sendRsvp(eventRsvp);
  }


  private eventChangeListeners: Function[] = new Array<Function>();

  public registerEventSelectionListener(callback: Function) {
    this.eventChangeListeners.push(callback);
  }

  public unregisterEventSelectionListener(callback: Function) {
    var index = this.eventChangeListeners.indexOf(callback, 0);
    if (index > -1) {
       this.eventChangeListeners.splice(index, 1);
    }
  }

  public notifyEventSelectionListeners(event: Event) {
    for (var index = 0; index < this.eventChangeListeners.length; index++) {
      this.eventChangeListeners[index](event);
    }
  }


  private eventUpdatedListeners: Function[] = new Array<Function>();

  public registerEventUpdateListener(callback: Function) {
    this.eventUpdatedListeners.push(callback);
  }

  public unregisterEventUpdateListener(callback: Function) {
    var index = this.eventUpdatedListeners.indexOf(callback, 0);
    if (index > -1) {
       this.eventUpdatedListeners.splice(index, 1);
    }
  }

  public notifyEventUpdateListeners(event: Event) {
    for (var index = 0; index < this.eventUpdatedListeners.length; index++) {
      this.eventUpdatedListeners[index](event);
    }
  }
}
