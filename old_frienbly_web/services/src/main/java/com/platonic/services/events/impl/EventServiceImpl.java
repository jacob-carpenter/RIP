package com.platonic.services.events.impl;

import com.platonic.models.chat.Chat;
import com.platonic.models.chat.ChatMember;
import com.platonic.models.events.Event;
import com.platonic.models.events.EventRsvp;
import com.platonic.models.events.EventRsvpStatusType;
import com.platonic.models.user.UserDetails;
import com.platonic.services.events.EventService;
import com.platonic.data.access.events.EventRepository;
import com.platonic.data.access.events.EventRsvpRepository;
import com.platonic.services.messenger.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class EventServiceImpl implements EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventRsvpRepository eventRsvpRepository;

    @Autowired
    private ChatService chatService;

    @Override
    public Event saveEvent(Event event) {
        boolean newEvent = event.getEventId() == null;

        if (newEvent || event.getSentDateTime() == null) {
            event.setSentDateTime(new Timestamp(new java.util.Date().getTime()));
        }

        event = eventRepository.save(event);

        if (newEvent) {
            EventRsvp eventRsvp = new EventRsvp();
            eventRsvp.setEventId(event.getEventId());
            eventRsvp.setUserId(event.getSentByUserId());
            eventRsvp.setRsvpStatusType(EventRsvpStatusType.ACCEPTED);
            eventRsvp.setRsvpSentTime(new Timestamp(new java.util.Date().getTime()));

            eventRsvpRepository.save(eventRsvp);

            event.setEventRsvps(Collections.singletonList(eventRsvp));
        }

        return event;
    }

    @Override
    public EventRsvp saveEventRsvp(EventRsvp eventRsvp) {
        EventRsvp foundEventRsvp = eventRsvpRepository.findOneByUserIdAndEventId(eventRsvp.getUserId(), eventRsvp.getEventId());
        if (foundEventRsvp == null) {
            foundEventRsvp = eventRsvp;
        }

        foundEventRsvp.setRsvpStatusType(eventRsvp.getRsvpStatusType());
        foundEventRsvp.setRsvpSentTime(new Timestamp(new java.util.Date().getTime()));
        eventRsvpRepository.save(foundEventRsvp);

        return foundEventRsvp;
    }

    @Override
    @Transactional
    public Event getEventById(Long eventId) {
        Event event = eventRepository.getOne(eventId);

        event.getEventRsvps();

        return event;
    }

    @Override
    public List<Event> getEventsByIds(List<Long> eventIds) {
        return eventRepository.findAll(eventIds);
    }

    @Override
    public List<Event> getEvents(Long userId) {
        List<Long> chatIds = new ArrayList<Long>();
        for (Chat chat : chatService.get(userId)) {
            chatIds.add(chat.getChatId());
        }
        Timestamp threeHoursInFuture = new Timestamp(new java.util.Date().getTime());
        threeHoursInFuture.setTime(threeHoursInFuture.getTime() - (180 * 60 * 1000));

        List<Event> eventsToReturn = new ArrayList<Event>();
        for (Event event : eventRepository.findAllByEventDateTimeAfterAndTargettedChatIdIn(threeHoursInFuture, chatIds)) {
            if (event.getCancelled() == null || !event.getCancelled()) {
                eventsToReturn.add(event);
            }
        }
        return eventsToReturn;
    }

    @Override
    public List<EventRsvp> getEventRsvps(Long eventId) {
        List<EventRsvp> eventRsvps = eventRsvpRepository.findAllByEventId(eventId);

        Event event = getEventById(eventId);

        List<Long> chatUserIds = new ArrayList<Long>();
        for (UserDetails userDetail : chatService.getMembers(event.getTargettedChatId())) {
            if (userDetail.isEnabled()) {
                chatUserIds.add(userDetail.getId());
            }
        }

        List<EventRsvp> finalRsvps = new ArrayList<EventRsvp>();
        for (EventRsvp eventRsvp : eventRsvps) {
            if (chatUserIds.contains(eventRsvp.getUserId())) {
                finalRsvps.add(eventRsvp);
            }
        }

        return finalRsvps;
    }
}
