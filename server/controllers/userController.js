import User from '../models/userModel.js';
import * as factory from '../controllers/handlerFactory.js';

export const getMe = async (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

export const getUser = factory.getOne(User)
export const getAllUsers = factory.getAll(User);
