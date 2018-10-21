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
export default {
/**
 * signup a new user
 * Routes: POST: /api/v1/signup
 * @param {any} req user request object
 * @param {any} res server response
 * @return {void} json server response
 */
  async signUp(req, res) {
    if ((!req.body.username) || (!req.body.email) || (!req.body.password)) {
      return res.status(400).json({
        error: 'Either email, password or username must not be empty',
        success: false,
      });
    } else if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).json({
        error: 'Passwords did not match',
        success: false,
      });
    }
    let email;
    try {
      email = await Users.findOne({ email: req.body.email });
      if (email) {
        return res.status(409).json({
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
    } catch (e) { return res.status(500).json({ error: e }); }
  },

  /**
   * * Routes: POST: /api/v1/signin
   * @param {any} req user request object
   * @param {any} res server response
   * @return {void} json server response
   */
  async signIn(req, res) {
    if ((!req.body.email) || (!req.body.password)) {
      return res.status(400).json({
        error: 'Email or password must not be empty',
        success: false,
      });
    }
    let response;
    try {
      response = await Users.findOne({ email: req.body.email });
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
        _id: response._id,
        message: 'Sign in successful',
        success: true,
        token: createToken(response),
      });
    } catch (e) { return res.status(500).json({ error: e }); }
  },

  /**
   * json Reset password email
   * Routes: POST: /api/v1/developer/:id
   * @param {any} req user request object
   * @param {any} res server response
   * @returns {response} response object
   */
  async developer(req, res) {
    let user;
    try {
      user = await Users.findOne({ _id: req.params.id.trim() });
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
    } catch (e) {
      return res.status(404).json({
        error: e,
        message: 'Invalid user id',
        success: false
      });
    }
  },

  /**
   * Routes: GET: /api/v1/developers?developers=searchquery&offset=A&limit=B
   * @description This fetch all ideas created by a user
   * @param {any} req user request object
   * @param {any} res server response
   * @return {void}
   * @memberOf UsersController
   */
  async getDevelopers(req, res) {
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
  },

  /**
   * Routes: DELETE: /api/v1/users/:id
   * @description This fetch all ideas created by a user
   * @param {any} req user request object
   * @param {any} res server response
   * @return {void}
   * @memberOf UsersController
   */
  async deleteAccount(req, res) {
    if (
      (req.params.id === undefined) ||
      (req.params.id !== req.decoded.token.user._id)) {
      return res.status(401).json({
        success: false,
        error: 'User`s not authorized to perform this operation'
      });
    }
    let user;
    try {
      user = await Users.findById({ _id: req.decoded.token.user._id });
      if (user) {
        Users.remove({ _id: req.decoded.token.user._id })
          .then(() => res.status(202).send({
            success: true,
            message: 'Account deleted successfully'
          }));
      }
    } catch (e) { return res.status(500).json({ error: e }); }
  },

  /**
   * json Reset password email
   * Routes: POST: /api/v1/passwords
   * @param {any} req user request object
   * @param {any} res server response
   * @returns {response} response object
   */
  async resetPassword(req, res) {
    if (!req.body.email) {
      return res.status(400).send({
        success: false,
        error: 'User email is required'
      });
    }
    const hash = crypto.randomBytes(20).toString('hex');
    const date = Date.now() + 3600000;
    let response;
    try {
      response = await Users.findOne({ email: req.body.email });
      if (!response) {
        return res.status(404).json({
          success: false,
          error: 'User does not exist'
        });
      }
      let user;
      try {
        user = await Users.findByIdAndUpdate(
          { _id: response._id },
          {
            $set: {
              hash: hash.trim(),
              expiryTime: date,
            },
          },
          { new: true }
        );
        if (!user) {
          return res.status(503).json({
            success: false,
            error: 'Password reset failed',
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
      } catch (e) { return res.status(500).json({ error: e }); }
    } catch (e) { return res.status(500).json({ error: e }); }
  },

  /**
   * Update Password
   * Route: PUT: /api/v1/passwords/:hash
   * @param {any} req user request object
   * @param {any} res server response
   * @return {void}
   */
  async updatePassword(req, res) {
    if ((!req.body.newPassword) || (!req.body.confirmPassword)) {
      return res.status(400).json({
        error: 'New password or confirm password must not be empty',
        success: false,
      });
    }
    let user;
    try {
      user = await Users.findOne({ hash: req.params.hash });
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
    } catch (e) { return res.status(500).json({ error: e }); }
  },

  /**
   * Routes: PUT: /api/v1/profiles
   * @param {any} req user request object
   * @param {any} res servers response
   * @return {void} json server response
   */
  async updateProfile(req, res) {
    const {
      username, address,
      location, developer, stack
    } = req.body;
    if ((!req.body.username) || (!req.body.address)) {
      return res.status(400).json({
        error: 'Username or address is required',
        success: false,
      });
    } else if (
      (!req.body.location) || (!req.body.developer) || (!req.body.stack)) {
      return res.status(400).json({
        error: 'Location or Stack or Developer`s specialization is required',
        success: false,
      });
    }
    let user;
    try {
      user = await Users.findByIdAndUpdate(
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
      );
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not Found',
        });
      }
      return res.status(200).json({
        id: user.id,
        username: user.username,
        address: user.address,
        developer: user.developer,
        stacks: user.stacks,
        location: user.location,
        message: 'Profile updated successfully',
        success: true,
      });
    } catch (e) { return res.status(500).json({ error: e }); }
  }
};
