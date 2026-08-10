import mongoose from 'mongoose';
import User from '../models/userModel.js';
import AppError from '../utils/appError.js';
import Tour from '../models/tourModel.js';

export const addFavorite = async (userId, tourId) => {
  if (!mongoose.Types.ObjectId.isValid(tourId)) {
    throw new AppError('Invalid tour id', 400);
  }

  const tourExists = await Tour.exists({ _id: tourId });
  if (!tourExists) {
    throw new AppError('Tour not found', 404);
  }
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $addToSet: {
        favorites: tourId,
      },
    },
    {
      new: true,
    },
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};

export const deleteFavorite = async (userId, tourId) => {
  if (!mongoose.Types.ObjectId.isValid(tourId)) {
    throw new AppError('Invalid tour id', 400);
  }
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $pull: {
        favorites: tourId,
      },
    },
    {
      new: true,
    },
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

export const getFavoriteIds = async (userId) => {
  const user = await User.findById(userId).select('favorites');
  if (!user) throw new AppError('User not found', 404);
  return user.favorites; 
};

export const getFavorites = async (userId) => {
  const user = await User.findById(userId).populate('favorites');
  if (!user) throw new AppError('User not found', 404);
  return user.favorites; 
};
