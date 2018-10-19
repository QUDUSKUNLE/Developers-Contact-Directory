
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

/**
 * Route for users to update profile
 */
route.put(
  '/profiles',
  verifyToken,
  UsersController.updateProfile,
);


export default route;
