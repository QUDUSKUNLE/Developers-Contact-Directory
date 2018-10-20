
import 'babel-polyfill';
import express from 'express';
import UsersController from '../controllers/UsersController';
import validateRequest from '../middlewares/validateRequest';
import verifyToken from '../middlewares/verifyToken';


/**
 * Creates express Router
 */
const route = express.Router();

/**
 * Route for signup users
 */
route.post(
  '/signup',
  validateRequest,
  UsersController.signUp,
);

/**
 * Route for signin users
 */
route.post(
  '/signin',
  validateRequest,
  UsersController.signIn,
);

/**
 * Route to query for a user
 */
route.get(
  '/developer/:id',
  UsersController.developer
);

/**
 * Route to get all users and search for users
 */
route.get(
  '/developers',
  UsersController.getDevelopers
);

/**
 * Route for users to update profile
 */
route.put(
  '/profiles',
  verifyToken,
  UsersController.updateProfile,
);

/**
 * Route for a user to delete account
 */
route.delete(
  '/users/:id',
  verifyToken,
  UsersController.deleteAccount,
);


/**
 * Route for users to request for password reset
 */
route.post(
  '/passwords',
  validateRequest,
  UsersController.resetPassword,
);

/**
 * Route for users to update password
 */
route.put(
  '/passwords/:hash',
  validateRequest,
  UsersController.updatePassword,
);

export default route;
