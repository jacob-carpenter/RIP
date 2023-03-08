package com.platonic.contracts.user.replies;

import com.platonic.contracts.exceptions.ExceptionType;
import com.platonic.contracts.user.UserFieldType;

public class UserRegistrationReply {
    private ExceptionType exceptionType;
    private UserFieldType erroredField;

    public UserRegistrationReply() {}

    public UserRegistrationReply(ExceptionType exceptionType, UserFieldType fieldType) {
        this.exceptionType = exceptionType;
        this.erroredField = fieldType;
    }

    public ExceptionType getExceptionType() {
        return exceptionType;
    }

    public UserFieldType getErroredField() {
        return erroredField;
    }
}
