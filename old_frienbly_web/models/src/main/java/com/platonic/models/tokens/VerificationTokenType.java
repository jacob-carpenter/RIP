package com.platonic.models.tokens;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.NUMBER_INT)
public enum VerificationTokenType {
    ACCOUNT, FORGOT_PASSWORD, CHANGE_EMAIL;
}
