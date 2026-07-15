import * as factory from '../controllers/handlerFactory.js';
import Tour from '../models/tourModel.js';

export const getAllTour = factory.getAll(Tour);
export const createTour = factory.createOne(Tour);
export const updateTour = factory.updateOne(Tour);
export const deleteTour = factory.deleteOne(Tour);
