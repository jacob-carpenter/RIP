package com.platonic.data.access.events;

import com.platonic.models.events.EventRsvp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRsvpRepository extends JpaRepository<EventRsvp, Long> {

    EventRsvp findOneByUserIdAndEventId(Long userId, Long eventId);

    List<EventRsvp> findAllByEventId(Long eventId);
}
