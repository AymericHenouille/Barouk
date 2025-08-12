import app from './app.js';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });
const listenPort = process.env.PORT;

app.listen(listenPort, () => {
  console.info(`🚀 Barouk server listening on port: ${listenPort}`);
}).on('error', (error) => {
  throw new Error(error.message);
});
