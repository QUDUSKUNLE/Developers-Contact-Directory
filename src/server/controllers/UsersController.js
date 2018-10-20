import bcrypt from 'bcrypt';
import crypto from 'crypto';
import dotenv from 'dotenv';

import createToken from '../utils/createToken';
import sendEmail from '../utils/sendEmail';
import Users from '../models/Users';
import pagination from '../helpers/pagination';
import normalize from '../helpers/normalize';

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
          }
          const user = new Users({
            username: normalize.text(req.body.username),
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
              success: true,
              token: createToken(newUser),
            });
          });
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
          });
        });
    }
  }

  /**
   * json Reset password email
   * Routes: POST: /api/v1/developer/:id
   * @param {any} req user request object
   * @param {any} res server response
   * @returns {response} response object
   */
  static developer(req, res) {
    Users.findOne({ _id: req.params.id.trim() })
      .exec((err, user) => {
        if (err) {
          return res.status(404).json({
            success: false,
            error: err.message,
            message: 'User does not exist'
          });
        }
        return res.status(200).json({
          user: {
            _id: user._id,
            username: user.username,
            address: user.address,
            developer: user.developer,
            location: user.location,
            stacks: user.stacks
          }
        });
      });
  }

  /**
   * Routes: GET: /api/v1/developers?developers=searchquery&offset=A&limit=B
   * @description This fetch all ideas created by a user
   * @param {any} req user request object
   * @param {any} res server response
   * @return {void}
   * @memberOf UsersController
   */
  static getDevelopers(req, res) {
    const offset = parseInt(req.query.offset, 10);
    const limit = parseInt(req.query.limit, 10);
    let count;
    if (req.query.developers === undefined) {
      Users.count({
      }, (err, isCount) => {
        count = isCount;
        Users.find({})
          .skip(offset)
          .limit(limit)
          .exec((err, developers) => {
            if (err) {
              return res.status(503).json({
                success: false,
                error: err.message
              });
            }
            return res.status(200).json({
              developers: normalize.extractData(developers),
              pageInfo: pagination(count, limit, offset)
            });
          });
      });
    } else {
      Users.count({
        developer: { $eq: normalize.text(req.query.developers.trim()) }
      }, (err, isCount) => {
        count = isCount;
        Users.find({})
          .where({
            developer:
            {
              $eq: normalize.text(req.query.developers.trim())
            }
          })
          .skip(offset)
          .limit(limit)
          .exec((err, developers) => {
            if (err) {
              return res.status(503).json({
                success: false,
                error: err.message
              });
            }
            return res.status(200).json({
              developers: normalize.extractData(developers),
              pageInfo: pagination(count, limit, offset)
            });
          });
      });
    }
  }

  /**
   * Routes: GET: /api/v1/users/:id
   * @description This fetch all ideas created by a user
   * @param {any} req user request object
   * @param {any} res server response
   * @return {void}
   * @memberOf UsersController
   */
  static deleteAccount(req, res) {
    if (
      (req.params.id === undefined) ||
      (req.params.id !== req.decoded.token.user._id)) {
      return res.status(401).json({
        success: false,
        error: 'User`s not authorized to perform this operation'
      });
    }
    Users.findById({ _id: req.decoded.token.user._id })
      .exec()
      .then((user) => {
        if (user) {
          Users.remove({
            _id: req.decoded.token.user._id
          }).then(() => res.status(202).send({
            success: true,
            message: 'Account deleted successfully'
          })).catch(error => res.status(500).send({
            success: false,
            error: error.message
          }));
        }
        if (!user) {
          res.status(404).send({
            success: false,
            error: 'User does not exist'
          });
        }
      }).catch(error => res.status(401).send({
        success: false,
        message: 'Unathorized, invalid user identity',
        error: error.message
      }));
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
          username: normalize.text(username.trim()),
          address: address.trim(),
          location: normalize.text(location.trim()),
          developer: normalize.text(developer.trim()),
          stacks: normalize.text(stack.trim())
        },
      },
      { new: true },
    )
      .exec((error, user) => {
        if (user) {
          return res.status(200).json({
            id: user.id,
            address: user.address,
            developer: user.developer,
            stacks: user.stacks,
            location: user.location,
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
