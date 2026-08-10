import catchAsync from '../utils/catchAsync.js';
import * as favoritesService from '../services/favoriteService.js';
import sendResponse from '../utils/sendResponse.js';
import AppError from '../utils/appError.js';

export const addFavorite = catchAsync(async (req, res, next) => {
  const { tourId } = req.params;
  await favoritesService.addFavorite(req.user.id, tourId);
  sendResponse(res, 200, {
    message: 'Tour added to favorites',
    data: {
      tourId,
      isFavorite: true,
    },
  });
});
export const deleteFavorite = catchAsync(async (req, res, next) => {
  const { tourId } = req.params;
  await favoritesService.deleteFavorite(req.user.id, tourId);

  sendResponse(res, 200, {
    message: 'Tour deleted from favorites',
    data: {
      tourId,
      isFavorite: false,
    },
  });
});

export const getFavoriteIds = catchAsync(async (req, res, next) => {
  const ids = await favoritesService.getFavoriteIds(req.user.id);
  sendResponse(res, 200, { data: ids });
});

export const getFavorites = catchAsync(async (req, res, next) => {
  const favorites = await favoritesService.getFavorites(req.user.id);
  sendResponse(res, 200, { data: favorites });
});
