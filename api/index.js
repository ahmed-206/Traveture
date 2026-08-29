import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from '../server/app.js';

dotenv.config({ path: './server/.env' });

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD,
  );

  await mongoose.connect(DB);
  isConnected = true;
  console.log('DB connection success (serverless)');
}

export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}
