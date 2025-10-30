import dotenv from 'dotenv';
import { Options } from './models/options.model.js';
import app from './app.js';

dotenv.config({ quiet: true });
const options = Options.parse(process.env);

app(options).listen(options.PORT, () => {
  console.info(`🚀 Barouk server listening on port: ${options.PORT}`);
}).on('error', (error) => {
  throw new Error(error.message);
});

