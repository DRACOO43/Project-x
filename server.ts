import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import { connectDB } from './server/config/db.ts';
import { dataStore } from './server/services/dataStore.ts';
import { createApp } from './server/app.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // 1. Initialize Database connection and seed data
  await connectDB();
  await dataStore.initSeed();

  // 2. Instantiate Express App
  const app = createApp();
  const PORT = process.env.PORT || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // 3. Mount Vite in Dev or Static files in Production
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // 4. Start listening on port 3000
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🚀 Smart Platform for Project Management is Running!`);
    console.log(`📍 URL: http://0.0.0.0:${PORT}`);
    console.log(`📦 REST API Base: http://0.0.0.0:${PORT}/api`);
    console.log(`✨ Mode: ${isProduction ? 'Production' : 'Development'}`);
    console.log(`=======================================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server boot error:', err);
  process.exit(1);
});
