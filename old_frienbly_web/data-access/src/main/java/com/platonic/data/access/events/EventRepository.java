package com.platonic.data.access.events;

import com.platonic.models.events.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.sql.Timestamp;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findAllByEventDateTimeAfterAndTargettedChatIdIn(Timestamp eventDateTime, List<Long> targettedChatIds);
}
