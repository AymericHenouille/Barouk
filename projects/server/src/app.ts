import express from 'express';
import session from 'express-session';
import authRoute from './routes/auth.route.js';
import speechRoute from './routes/speech.route.js';
import GoogleAuthService from './services/google-auth.service.js';
import GoogleSheetService from './services/google-sheet.service.js';
import SpeechService from './services/speech.service.js';

const app = express();
app.use(session({
  name: 'barouk.sid',
  secret: 'secret hash',
  saveUninitialized: true,
  resave: false,
  cookie: { secure: false },
}));

const googleAuthService = new GoogleAuthService();
const googleSheetService = new GoogleSheetService(googleAuthService);
const speechService = new SpeechService(googleSheetService);

app.use('/auth', authRoute(googleAuthService));
app.use('/speeches', speechRoute(speechService));

export default app;
