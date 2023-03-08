package com.platonic.models.user;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.NUMBER_INT)
public enum SexType {
    UNKNOWN, FEMALE, MALE, OTHER
}
