import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes.js';
import tourRoutes from './routes/tourRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import AppError from './utils/appError.js';
import globalErrorHandler from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();


app.set("query parser", "extended");

app.use(express.static(path.join(__dirname, 'public')));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true, 
}));
app.use(express.json());

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/reviews', reviewRoutes);


app.all('/{*any}', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});


app.use(globalErrorHandler);

export default app;
