package com.platonic.services.events;

import com.platonic.models.events.Event;
import com.platonic.models.events.EventRsvp;

import java.util.List;

public interface EventService {

    Event saveEvent(Event event);

    EventRsvp saveEventRsvp(EventRsvp eventRsvp);

    Event getEventById(Long eventId);

    List<Event> getEventsByIds(List<Long> eventIds);

    List<Event> getEvents(Long userId);

    List<EventRsvp> getEventRsvps(Long eventId);
}
