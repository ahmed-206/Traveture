import mongoose from 'mongoose';
import app from '../server/app.js';

// Suppress DEP0169 url.parse deprecation warning in Node 22+
process.on('warning', (warning) => {
  if (
    warning.name === 'DeprecationWarning' &&
    (warning.code === 'DEP0169' || warning.message?.includes('url.parse'))
  ) {
    return;
  }
  console.warn(warning);
});

if (!process.env.VERCEL) {
  const dotenv = await import('dotenv');
  dotenv.config({ path: './server/.env' });
}

let cachedPromise = null;

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;

  if (!cachedPromise) {
    if (!process.env.DATABASE || !process.env.DATABASE_PASSWORD) {
      throw new Error(
        'Missing DATABASE or DATABASE_PASSWORD environment variables in Vercel settings',
      );
    }

    const DB = process.env.DATABASE.replace(
      '<PASSWORD>',
      process.env.DATABASE_PASSWORD,
    );

    cachedPromise = mongoose
      .connect(DB, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 20000,
        bufferCommands: false,
      })
      .then((m) => {
        console.log('DB connection success (serverless)');
        return m;
      })
      .catch((err) => {
        cachedPromise = null;
        throw err;
      });
  }

  await cachedPromise;
}

export default async function handler(req, res) {
  try {
    await connectDB();
    return app(req, res);
  } catch (err) {
    console.error('Serverless Handler Database Error:', err);
    return res.status(500).json({
      status: 'error',
      message:
        'Database connection failed. Please ensure MongoDB Atlas IP whitelist includes 0.0.0.0/0 and Vercel environment variables (DATABASE, DATABASE_PASSWORD) are set.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
}
