import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { beforeAll, beforeEach, afterAll } from 'vitest';

dotenv.config({ path: './.env' });

beforeAll(async () => {
  const DB = process.env.DATABASE_TEST.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD,
  );


  await mongoose.connect(DB);
});
beforeEach(async () => {
  
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});
afterAll(async () => {
  await mongoose.connection.close();
});