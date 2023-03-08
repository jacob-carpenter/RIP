package com.platonic.models.chat;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.NUMBER_INT)
public enum ChatType {
    GROUP, USER, USER_EPHEMERAL, GROUP_EPHEMERAL
}
