import User from '../models/userModel.js';
import * as factory from '../controllers/handlerFactory.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import sendResponse from '../utils/sendResponse.js';
import { filterObject } from '../utils/filterObject.js';


export const getMe = async (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

export const getAllUsers = factory.getAll(User);
export const getUser = factory.getOne(User);
export const updateUser = factory.updateOne(User);
export const deleteUser = factory.deleteOne(User);




export const UpdateMyProfile = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password update.', 400));
  }

  const filteredBody = filterObject(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  sendResponse(res, 200, {
    message: 'Profile updated successfully',
    data: updatedUser,
  });
});
