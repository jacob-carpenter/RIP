package com.platonic.contracts.user;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.NUMBER_INT)
public enum UserFieldType {
    USERNAME, EMAIL, PASSWORD;
}
