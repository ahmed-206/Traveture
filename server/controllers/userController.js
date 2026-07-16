import User from '../models/userModel.js';
import * as factory from '../controllers/handlerFactory.js';

export const getMe = async (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

export const getAllUsers = factory.getAll(User);
export const getUser = factory.getOne(User);
export const updateUser = factory.updateOne(User);
export const deleteUser = factory.deleteOne(User);
