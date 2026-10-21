import dotenv from 'dotenv';
import { connectDB } from './config/db.ts';
import { dataStore } from './services/dataStore.ts';
import { createApp } from './app.ts';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  await connectDB();
  await dataStore.initSeed();

  const app = createApp();

  app.listen(Number(PORT), () => {
    console.log(`Backend API Server running independently on port ${PORT}`);
  });
}

bootstrap().catch(console.error);
