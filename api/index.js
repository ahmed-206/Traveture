
import mongoose from 'mongoose';
import app from '../server/app.js';

if (!process.env.VERCEL) {
  const dotenv = await import('dotenv');
  dotenv.config({ path: './server/.env' });
}

async function connectDB() {
  
  if (mongoose.connection.readyState === 1) return;

  if (!process.env.DATABASE || !process.env.DATABASE_PASSWORD) {
    throw new Error('Missing DATABASE environment variables');
  }

  const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD,
  );

  await mongoose.connect(DB, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 20000,
    bufferCommands: false, 
  });

  console.log('DB connection success (serverless)');
}

export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}