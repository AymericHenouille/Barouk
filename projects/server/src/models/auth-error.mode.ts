import { BaroukError } from './barouk-error.model.js';

export class AuthentificationRequiredError extends BaroukError {
  public constructor(message = 'You should to be logged in for this route') {
    super(401, message);
  }
}

export class PermissionDeniedError extends BaroukError {
  public constructor(message = 'This resource is protected. You can\'t access to it') {
    super(403, message);
  }
}
