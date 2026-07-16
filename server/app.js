import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes.js';
import tourRoutes from './routes/tourRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(cookieParser());
app.use(cors());
app.use(express.json());

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/reviews', reviewRoutes);
export default app;
