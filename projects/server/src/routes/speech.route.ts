import { Router, type Request, type Response } from 'express'; 
import type SpeechService from '../services/speech.service.js';
import { sendErrorResponse } from '../models/barouk-error.model.js';

export default function(speechService: SpeechService): Router {
  const router = Router({ });
  router.get('/', async (request: Request, response: Response) => {
    console.log(request.params.ids);
    const sessionID = request.sessionID;
    try {
      const speeches = await speechService.getSpeechs(sessionID);
      response.status(200).send(speeches).end();
    } catch (error) {
      sendErrorResponse(error, response);
    }
  });
  return router;
} 
