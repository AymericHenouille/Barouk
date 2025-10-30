import zod from 'zod';

export const Options = zod.object({
  NODE_ENV: zod.string().default('development'),
  PORT: zod.coerce.number({ error: 'Need a number as port' }).default(3000),
  GOOGLE_CREDENTIALS: zod.string(),
  SESSION_NAME: zod.string().default('barouk.sid'),
  SESSION_SECRET: zod.string().min(32),
  SESSION_COOKIE_DOMAIN: zod.string().default('localhost'),
  REDIS_URL: zod.string().optional(),
});

export type Options = zod.infer<typeof Options>;
