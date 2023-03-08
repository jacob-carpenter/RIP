import {ExceptionType} from '../../exceptions/exception.type';

import {UserFieldType} from '../user-field.type';

export class UserRegistrationReply {
  private exceptionType: ExceptionType;
  private erroredField: UserFieldType;

  constructor(exceptionType: ExceptionType, erroredField: UserFieldType) {
    this.exceptionType = exceptionType;
    this.erroredField = erroredField;
  }

  getExceptionType(): ExceptionType {
    return this.exceptionType;
  }

  getErroredField(): UserFieldType {
    return this.erroredField;
  }
}
