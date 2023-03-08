package com.platonic.models.requests;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.NUMBER_INT)
public enum RequestType {
    FORM_CONNECTION, JOIN_GROUP, DISSOLVE_CONNECTION
}
