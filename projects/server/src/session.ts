import session from 'express-session';
import { createClient } from 'redis';
import { RedisStore } from 'connect-redis';
import type { Options } from './models/options.model.js';

const MAX_AGE = 60 * 60 * 24 * 7 * 2;

export default function(options: Options) {
  return session({
    name: options.SESSION_NAME,
    secret: options.SESSION_SECRET,
    store: createSessionStore(options),
    resave: false,
    saveUninitialized: false,
    rolling: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: MAX_AGE,
      domain: options.SESSION_COOKIE_DOMAIN,
    },
  });
}

function createSessionStore(options: Options): session.Store {
  if (options.REDIS_URL) {
    const redisClient = createClient({ url: options.REDIS_URL });
    redisClient.on('error', (error) => console.error('[REDIS]: ', error));
    return new RedisStore({
      client: redisClient,
      ttl: MAX_AGE,
      prefix: 'sess:',
      disableTouch: false,
    });
  }
  return new session.MemoryStore({ captureRejections: true });
}
