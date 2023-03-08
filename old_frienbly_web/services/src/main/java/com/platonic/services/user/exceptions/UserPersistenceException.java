package com.platonic.services.user.exceptions;

import com.platonic.contracts.user.UserFieldType;
import com.platonic.contracts.exceptions.ExceptionType;

public class UserPersistenceException extends Exception {

    private ExceptionType exceptionType;
    private UserFieldType errorFieldType;

    public ExceptionType getExceptionType() {
        return exceptionType;
    }

    public void setExceptionType(ExceptionType exceptionType) {
        this.exceptionType = exceptionType;
    }

    public UserFieldType getErrorFieldType() {
        return errorFieldType;
    }

    public void setErrorFieldType(UserFieldType errorFieldType) {
        this.errorFieldType = errorFieldType;
    }

    public UserPersistenceException() {
        super();
    }

    public UserPersistenceException(ExceptionType exceptionType, UserFieldType errorFieldType) {
        super();
        this.exceptionType = exceptionType;
        this.errorFieldType = errorFieldType;
    }

    public UserPersistenceException(String message) {
        super(message);
    }

    public UserPersistenceException(String message, Throwable cause) {
        super(message, cause);
    }

    public UserPersistenceException(Throwable cause) {
        super(cause);
    }
}