import 'dotenv/config';
import mongoose from 'mongoose';
import app from '../server/app.js';

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  if (!process.env.DATABASE || !process.env.DATABASE_PASSWORD) {
    throw new Error('Missing DATABASE environment variables');
  }

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