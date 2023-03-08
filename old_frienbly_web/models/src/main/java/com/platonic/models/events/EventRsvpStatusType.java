package com.platonic.models.events;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.NUMBER_INT)
public enum EventRsvpStatusType {
    ACCEPTED, MAYBE, DECLINED
}
