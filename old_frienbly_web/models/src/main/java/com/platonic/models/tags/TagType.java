package com.platonic.models.tags;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.NUMBER_INT)
public enum TagType {
    PERSONAL, INTERESTS, GROUP_SEARCH, USER_SEARCH
}
