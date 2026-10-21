import dotenv from 'dotenv';
import { connectDB } from '../config/db.ts';
import { dataStore } from '../services/dataStore.ts';

dotenv.config();

const runSeed = async () => {
  console.log('--- Seeding Smart Platform for Project Management Database ---');
  await connectDB();
  await dataStore.initSeed();
  console.log('--- Seeding Completed Successfully! ---');
  console.log('Default Accounts Available:');
  console.log('1. Admin: admin@smartpm.local / admin123');
  console.log('2. Project Manager: pm@smartpm.local / pm123');
  console.log('3. Team Member: member@smartpm.local / member123');
  process.exit(0);
};

runSeed().catch((err) => {
  console.error('Seed script encountered error:', err);
  process.exit(1);
});
