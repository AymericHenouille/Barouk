import type { Response } from 'express';

export class BaroukError extends Error {
  public constructor(
    public readonly code: number,
    message: string,
  ) { super(message) }

  public sendResponse(response: Response): void {
    response
      .status(this.code)
      .send(`${this.name}: ${this.message}`)
      .end();
  }
}

export function sendErrorResponse(error: unknown, response: Response): void {
  if (error instanceof BaroukError) {
    error.sendResponse(response);
  } else {
    response
      .status(500)
      .send(JSON.stringify(error));
  }
}
