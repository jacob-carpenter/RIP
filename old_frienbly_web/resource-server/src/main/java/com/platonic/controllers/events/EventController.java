package com.platonic.controllers.events;

import com.platonic.models.events.Event;
import com.platonic.models.events.EventRsvp;
import com.platonic.models.user.UserContext;
import com.platonic.services.events.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController()
@RequestMapping("api/event")
public class EventController {
    @Autowired
    private UserContext userContext;

    @Autowired
    private EventService eventService;

    @RequestMapping(method = RequestMethod.GET)
    public List<Event> getEventsByUser() {
        return eventService.getEvents(userContext.getCurrentUser().getId());
    }

    @RequestMapping(path="{eventId}", method = RequestMethod.GET)
    public Event getEventsByUser(Long eventId) {
        return eventService.getEventById(eventId);
    }

    @RequestMapping(path="getByIds", method = RequestMethod.POST)
    public List<Event> getEvents(@RequestBody List<Long> eventIds) {
        return eventService.getEventsByIds(eventIds);
    }

    @RequestMapping(method = RequestMethod.POST)
    public Event saveEvent(@RequestBody Event event) {
        event.setSentByUserId(userContext.getCurrentUser().getId());

        return eventService.saveEvent(event);
    }

    @RequestMapping(path="rsvps/{eventId}", method = RequestMethod.GET)
    public List<EventRsvp> getEventRsvps(@PathVariable Long eventId) {
        return eventService.getEventRsvps(eventId);
    }
}
