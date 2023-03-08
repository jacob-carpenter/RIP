package com.platonic.models.events;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "event_rsvp")
@JsonIgnoreProperties(ignoreUnknown = true)
public class EventRsvp {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "event_rsvp_id", nullable = false, updatable = false)
    private Long eventRsvpId;

    @Column(name = "event_id")
    private Long eventId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "rsvp_status_type")
    private EventRsvpStatusType rsvpStatusType;

    @Column(name = "rsvp_sent_time")
    private Timestamp rsvpSentTime;

    public Long getEventRsvpId() {
        return eventRsvpId;
    }

    public void setEventRsvpId(Long eventRsvpId) {
        this.eventRsvpId = eventRsvpId;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public EventRsvpStatusType getRsvpStatusType() {
        return rsvpStatusType;
    }

    public void setRsvpStatusType(EventRsvpStatusType rsvpStatusType) {
        this.rsvpStatusType = rsvpStatusType;
    }

    public Timestamp getRsvpSentTime() {
        return rsvpSentTime;
    }

    public void setRsvpSentTime(Timestamp rsvpSentTime) {
        this.rsvpSentTime = rsvpSentTime;
    }
}
