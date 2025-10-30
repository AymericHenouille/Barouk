import express, { type Express } from 'express';
import baroukSession from './session.js';
import authRoute from './routes/auth.route.js';
import speechRoute from './routes/speech.route.js';
import GoogleAuthService from './services/google-auth.service.js';
import GoogleSheetService from './services/google-sheet.service.js';
import SpeechService from './services/speech.service.js';
import type { Options } from './models/options.model.js';

export default function(options: Options): Express  {
  const app = express();

  const production = options.NODE_ENV === 'production';
  if (production) app.set('trust proxy', 1);

  app.use(express.json());
  app.use(baroukSession(options));
  
  const googleAuthService = new GoogleAuthService(options);
  const googleSheetService = new GoogleSheetService(googleAuthService);
  const speechService = new SpeechService(googleSheetService);
  
  app.use('/auth', authRoute(googleAuthService));
  app.use('/speeches', speechRoute(speechService));

  return app;
};
