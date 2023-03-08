package com.platonic.contracts.exceptions;

import com.fasterxml.jackson.annotation.JsonValue;

public enum ExceptionType {
    DUPLICATION, UNKNOWN;

    @JsonValue
    public int toValue() {
        return ordinal();
    }
}
