import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import User from '../models/userModel.js';


export const getMe = async (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});
