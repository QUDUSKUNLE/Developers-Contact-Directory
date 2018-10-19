import bcrypt from 'bcrypt';
import capitalize from 'capitalize';
import crypto from 'crypto';
import dotenv from 'dotenv';
import createToken from '../utils/createToken';
import sendEmail from '../utils/sendEmail';
import Users from '../models/Users';

dotenv.config();

/**
 * @class UsersController
 */
class UsersController {
  /**
   * signup a new user
   * Routes: POST: /api/v1/signup
   * @param {any} req user request object
   * @param {any} res server response
   * @return {void} json server response
   */
  static signUp(req, res) {
    if ((!req.body.username) || (!req.body.email) || (!req.body.password)) {
      res.status(400).json({
        error: 'Either email, password or username must not be empty',
        success: false,
      });
    } else if (req.body.password !== req.body.confirmPassword) {
      res.status(400).json({
        error: 'Passwords did not match',
        success: false,
      });
    } else {
      Users.findOne({
        email: req.body.email,
      })
        .exec()
        .then((email) => {
          if (email) {
            res.status(409).json({
              error: 'Email is already registered',
              success: false,
            });
          } else {
            Users.findOne({
              username: capitalize(req.body.username),
            })
              .exec()
              .then((username) => {
                if (username) {
                  res.status(409).json({
                    error: 'Username already exist',
                    success: false,
                  });
                } else {
                  const user = new Users({
                    username: capitalize(req.body.username),
                    password: req.body.password,
                    email: req.body.email,
                  });
                  user.save((error, newUser) => {
                    if (error) {
                      return res.status(500).json({
                        success: false,
                        message: error,
                      });
                    }
                    return res.status(201).json({
                      message: 'Sign up successful',
                      id: newUser._id,
                      success: true,
                      token: createToken(newUser),
                    });
                  });
                }
              });
          }
        });
    }
  }


  /**
   * * Routes: POST: /api/v1/signin
   * @param {any} req user request object
   * @param {any} res server response
   * @return {void} json server response
   */
  static signIn(req, res) {
    if ((!req.body.email) || (!req.body.password)) {
      res.status(400).json({
        error: 'Email or password must not be empty',
        success: false,
      });
    } else {
      Users.findOne({
        email: req.body.email,
      })
        .exec((err, response) => {
          if (err) {
            return res.status(500).json({
              success: false,
              error: 'internal server error',
            });
          }
          if (!response) {
            return res.status(404).json({
              success: false,
              error: 'User does not exist',
            });
          }
          // compare passwords
          if (!bcrypt.compareSync(req.body.password, response.password)) {
            return res.status(401).json({
              success: false,
              error: 'Email or password is invalid',
            });
          }
          return res.status(200).json({
            message: 'Sign in successful',
            success: true,
            token: createToken(response),
            id: response._id,
          });
        });
    }
  }


  /**
   * json Reset password email
   * Routes: POST: /api/v1/passwords
   * @param {any} req user request object
   * @param {any} res server response
   * @returns {response} response object
   */
  static resetPassword(req, res) {
    if (!req.body.email) {
      return res.status(400).send({
        success: false,
        error: 'User email is required'
      });
    }
    const hash = crypto.randomBytes(20).toString('hex');
    const date = Date.now() + 3600000;
    Users.findOne({
      email: req.body.email
    })
      .exec((err, response) => {
        if (err) {
          return res.status(500).json({
            success: false,
            error: 'internal server error'
          });
        }
        Users.findByIdAndUpdate(
          { _id: response._id },
          {
            $set: {
              hash: hash.trim(),
              expiryTime: date,
            },
          },
          { new: true }
        ).exec((error, user) => {
          if (error) {
            return res.status(500).json({
              success: false,
              error: 'Internal server error',
            });
          }
          sendEmail(
            user.email,
            user.username,
            hash, req.headers.host
          );
          return res.status(200).send({
            success: true,
            message: 'Reset password email sent successfully'
          });
        }).catch(error => res.status(500).send({ message: error }));
      }).catch(error => res.status(500).send({ message: error }));
  }


  /**
   * Update Password
   * Route: PUT: /api/v1/passwords/:hash
   * @param {any} req user request object
   * @param {any} res server response
   * @return {void}
   */
  static updatePassword(req, res) {
    if ((!req.body.newPassword) || (!req.body.confirmPassword)) {
      return res.status(400).json({
        error: 'New password or confirm password must not be empty',
        success: false,
      });
    }
    Users.findOne({ hash: req.params.hash })
      .then((user) => {
        if (!user) {
          return res.status(404).json({
            success: false,
            error: 'User does not exist',
          });
        }
        if (req.body.newPassword === req.body.confirmPassword) {
          const currentTime = Date.now();
          if (currentTime > user.expiryTime) {
            return res.status(410).json({
              success: false,
              error: 'Expired link',
            });
          }
          user.password = req.body.newPassword;
          user.save((err, updatedUser) => {
            if (err) {
              return res.status(503).json({
                success: false,
                error: err.message,
              });
            }
            Users.findByIdAndUpdate(
              { _id: updatedUser._id },
              {
                $set: { hash: '' },
              },
              { new: true },
            ).exec((error, hashUpdate) => {
              if (hashUpdate) {
                return res.status(200).json({
                  success: true,
                  message: 'Password has been updated',
                  hashUpdate,
                });
              }
              return res.status(503).json({
                success: false,
                error: error.message,
              });
            });
          });
        } else {
          return res.status(400).json({
            success: false,
            error: 'Please confirm password',
          });
        }
      })
      .catch(error => res.status(500).json({
        success: false,
        error: error.message,
      }));
  }


  /**
   * Routes: PUT: /api/v1/profiles
   * @param {any} req user request object
   * @param {any} res servers response
   * @return {void} json server response
   */
  static updateProfile(req, res) {
    const {
      username, address,
      location, developer, stack
    } = req.body;
    if ((!req.body.username) || (!req.body.address)) {
      return res.status(400).json({
        error: 'Email or username or address is required',
        success: false,
      });
    } else if (
      (!req.body.location) || (!req.body.developer) || (!req.body.stack)) {
      return res.status(400).json({
        error: 'Location or Stack or Developer`s specialization is required',
        success: false,
      });
    }
    Users.findByIdAndUpdate(
      { _id: req.decoded.token.user._id },
      {
        $set: {
          username: capitalize(username.trim()),
          address: address.trim(),
          location: capitalize(location.trim()),
          developer: capitalize(developer.trim()),
          stacks: capitalize(stack.trim())
        },
      },
      { new: true },
    )
      .exec((error, user) => {
        if (user) {
          return res.status(200).json({
            user: {
              id: user.id,
              address: user.address,
              developer: user.developer,
              stacks: user.stacks,
              location: user.location,
            },
            message: 'Profile updated successfully',
            success: true,
          });
        }
        return res.status(404).json({
          success: false,
          error: 'User not Found',
        });
      })
      .catch(() => res.status(500).json({ error: 'Internal server error' }));
  }
}

export default UsersController;
