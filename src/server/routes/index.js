
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
 * Route for signin developers
 */
route.post(
  '/signin',
  validateRequest,
  UsersController.signIn,
);

/**
 * Route to query for a developers
 */
route.get(
  '/developer/:id',
  UsersController.developer
);

/**
 * Route to get developers and search for developers
 */
route.get(
  '/developers',
  UsersController.getDevelopers
);

/**
 * Route for developers to update profile
 */
route.put(
  '/profiles',
  verifyToken,
  validateRequest,
  UsersController.updateProfile,
);

/**
 * Route for developers to delete account
 */
route.delete(
  '/developers/:id',
  verifyToken,
  UsersController.deleteAccount,
);


/**
 * Route for develoeprs to request for password reset
 */
route.post(
  '/passwords',
  validateRequest,
  UsersController.resetPassword,
);

/**
 * Route for developers to update password
 */
route.put(
  '/passwords/:hash',
  validateRequest,
  UsersController.updatePassword,
);

export default route;
