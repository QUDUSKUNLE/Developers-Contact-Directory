import chai from 'chai';
import assert from 'assert';
import chaiHttp from 'chai-http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import server from '../../../index';
import userData from '../__mock__/mockData';

dotenv.config();
chai.should();
const { expect } = chai;
chai.use(chaiHttp);


// Test for UserController
describe('User Controller test', () => {
  const { user } = userData;
  // Test sign up route
  describe('establishes connection with the database', () => {
    before((done) => {
      mongoose.createConnection(process.env.MONGODB_URL_TEST, () => {
        mongoose.connection.db.dropDatabase(() => {
          done();
        });
      });
    });
    it('should get home message', (done) => {
      chai.request(server)
        .get('/')
        .set('Content-Type', 'application/json')
        .end((err, res) => {
          res.should.have.status(200);
          assert.equal('DevelopersContact Home', res.body.home);
          done();
        });
    });
    it('should signup a new user', (done) => {
      chai.request(server)
        .post('/api/v1/signup')
        .set('Content-Type', 'application/json')
        .send(user.signUp)
        .end((err, res) => {
          res.should.have.status(201);
          assert.equal(true, res.body.success);
          res.body.should.have.property('message').equals('Sign up successful');
          done();
        });
    });
    it(
      'should return status 400 if password is less than 6 characters',
      (done) => {
        chai.request(server)
          .post('/api/v1/signup')
          .set('Content-Type', 'application/json')
          .send(user.signUpErr)
          .end((err, res) => {
            res.should.have.status(400);
            expect(res.body.success).to.eql(false);
            res.body.error.should
              .equals('Password length must be more than 6 characters');
            done();
          });
      }
    );
    it(
      'should return status 400 if password not defined',
      (done) => {
        chai.request(server)
          .post('/api/v1/signup')
          .type('application/json')
          .send(user.signUpUndefinedPass)
          .end((err, res) => {
            res.should.have.status(400);
            assert.equal(false, res.body.success);
            res.body.should.have.property('error')
              .equals('Either email, password or username must not be empty');
            done();
          });
      }
    );
    it('should return status 400 if username is an empty string', (done) => {
      chai.request(server)
        .post('/api/v1/signup')
        .set('Content-Type', 'application/json')
        .send(user.signUpEmptyUsername)
        .end((err, res) => {
          res.should.have.status(400);
          assert.equal(false, res.body.success);
          res.body.should.have.property('error')
            .equals('Username field cannot be empty');
          done();
        });
    });
    it(
      'should return status 400 if username charcter is less than 2',
      (done) => {
        chai.request(server)
          .post('/api/v1/signup')
          .set('Content-Type', 'application/json')
          .send(user.shortUserName)
          .end((err, res) => {
            res.should.have.status(400);
            assert.equal(false, res.body.success);
            res.body.should.have.property('error')
              .equals('Username must be more than 2 characters');
            done();
          });
      }
    );
    it('should return status 400 if email is an empty string', (done) => {
      chai.request(server)
        .post('/api/v1/signup')
        .type('form')
        .send(user.emptyEmail)
        .end((err, res) => {
          res.should.have.status(400);
          expect(res.body.success).to.eql(false);
          res.body.should.have.property('error')
            .equals('Email address field cannot be empty');
          done();
        });
    });
    it('should return status 400 if email is badly formatted', (done) => {
      chai.request(server)
        .post('/api/v1/signup')
        .type('form')
        .send(user.invalidEmail)
        .end((err, res) => {
          res.should.have.status(400);
          expect(res.body.success).to.eql(false);
          res.body.should.have.property('error')
            .equals('Email is badly formatted');
          done();
        });
    });
    it('should return status 409 if email already registered', (done) => {
      chai.request(server)
        .post('/api/v1/signup')
        .type('form')
        .send(user.existingEmail)
        .end((err, res) => {
          res.should.have.status(409);
          expect(res.body.success).to.eql(false);
          res.body.should.have.property('error')
            .equals('Email is already registered');
          done();
        });
    });
    it('should return status 400 if password is an empty string', (done) => {
      chai.request(server)
        .post('/api/v1/signup')
        .type('form')
        .send(user.emptyPassword)
        .end((err, res) => {
          res.should.have.status(400);
          expect(res.body.success).to.eql(false);
          res.body.error.should.equals('Password field cannot be empty');
          done();
        });
    });

    // Test sign in route
    describe('User signin route', () => {
      it(
        'should return status 400 if email or password not defined',
        (done) => {
          chai.request(server)
            .post('/api/v1/signin')
            .type('application/json')
            .send({ username: user.username })
            .end((err, res) => {
              res.should.have.status(400);
              assert.equal(false, res.body.success);
              res.body.should.have.property('error')
                .equals('Email or password must not be empty');
              done();
            });
        }
      );
      it('should return status 404 if user does not exist', (done) => {
        chai.request(server)
          .post('/api/v1/signin')
          .type('application/json')
          .send({
            email: user.secondEmail,
            password: user.password
          })
          .end((err, res) => {
            res.should.have.status(404);
            assert.equal(false, res.body.success);
            res.body.should.have.property('error')
              .equals('User does not exist');
            done();
          });
      });

      it('should return status 401 if user sends wrong password', (done) => {
        chai.request(server)
          .post('/api/v1/signin')
          .type('application/json')
          .send({ email: user.email, password: user.password })
          .end((err, res) => {
            res.should.have.status(401);
            assert.equal(false, res.body.success);
            res.body.should.have.property('error')
              .equals('Email or password is invalid');
            done();
          });
      });

      it('should return status 200 if a user sign in successfully', (done) => {
        chai.request(server)
          .post('/api/v1/signin')
          .type('application/json')
          .send(user.signIn)
          .end((err, res) => {
            res.should.have.status(200);
            assert.equal(true, res.body.success);
            res.body.should.have.property('message')
              .equals('Sign in successful');
            done();
          });
      });
    });

    // Test reset password route
    describe('User reset password route', () => {
      it('should return status 400 if email is not defined', (done) => {
        chai.request(server)
          .post('/api/v1/passwords')
          .type('application/json')
          .send({})
          .end((err, res) => {
            res.should.have.status(400);
            assert.equal(false, res.body.success);
            res.body.should.have.property('error')
              .equals('User email is required');
            done();
          });
      });
      it('should return status 404 if user email does not exist', (done) => {
        chai.request(server)
          .post('/api/v1/passwords')
          .type('application/json')
          .send({ email: user.secondEmail })
          .end((err, res) => {
            res.should.have.status(404);
            assert.equal(false, res.body.success);
            res.body.should.have.property('error')
              .equals('User does not exist');
            done();
          });
      });
      it('should return status 200 if reset password is successful', (done) => {
        chai.request(server)
          .post('/api/v1/passwords')
          .type('application/json')
          .send({ email: user.email })
          .end((err, res) => {
            res.should.have.status(200);
            assert.equal(true, res.body.success);
            res.body.should.have.property('message')
              .equals('Reset password email sent successfully');
            done();
          });
      });
    });
    // Test for update password route
    describe('User update password route', () => {
      it(
        'should return status 400 when new password is not defined',
        (done) => {
          const { hash } = { user };
          chai.request(server)
            .put(`/api/v1/passwords/${hash}`)
            .type('application/json')
            .send({})
            .end((err, res) => {
              res.should.have.status(400);
              assert.equal(false, res.body.success);
              res.body.should.have.property('error')
                .equals('New password or confirm password must not be empty');
              done();
            });
        }
      );

      it('should return status 404 when does not exist', (done) => {
        const { hash } = { user };
        chai.request(server)
          .put(`/api/v1/passwords/${hash}`)
          .type('application/json')
          .send({
            newPassword: user.secondEmail,
            confirmPassword: user.secondEmail
          })
          .end((err, res) => {
            res.should.have.status(404);
            assert.equal(false, res.body.success);
            res.body.should.have.property('error')
              .equals('User does not exist');
            done();
          });
      });
    });

    // Test for update profile route
    describe('User Update profile route', () => {
      let validToken = '';
      let id = '';
      before((done) => {
        chai.request(server)
          .post('/api/v1/signin')
          .send(user.signIn)
          .end((err, res) => {
            id = res.body._id;
            validToken = res.body.token;
            done();
          });
      });
      it(
        'should return status 400 when username or address is not defined',
        (done) => {
          chai.request(server)
            .put('/api/v1/profiles')
            .set('x-access-token', validToken)
            .type('application/json')
            .send({})
            .end((err, res) => {
              res.should.have.status(400);
              assert.equal(false, res.body.success);
              res.body.should.have.property('error')
                .equals('Username or address is required');
              done();
            });
        }
      );
      it('should return Stack field cannot be empty to update', (done) => {
        chai.request(server)
          .put('/api/v1/profiles')
          .set('x-access-token', validToken)
          .type('application/json')
          .send({
            username: user.emptyPassword.username,
            address: user.address,
            location: user.location,
            stack: ' ',
            developer: user.developer
          })
          .end((err, res) => {
            res.should.have.status(400);
            assert.equal(false, res.body.success);
            res.body.should.have.property('error')
              .equals('Stack field cannot be empty');
            done();
          });
      });
      it(`should return Stack must not be more than 20
       characters to update`, (done) => {
        chai.request(server)
          .put('/api/v1/profiles')
          .set('x-access-token', validToken)
          .type('application/json')
          .send({
            username: user.emptyPassword.username,
            address: user.address,
            location: user.location,
            stack: user.stacks,
            developer: user.developer
          })
          .end((err, res) => {
            res.should.have.status(400);
            assert.equal(false, res.body.success);
            res.body.should.have.property('error')
              .equals('Stack must not be more than 20 characters');
            done();
          });
      });
      it(
        `should return profile updated successfully when passes
        new username and email to update`,
        (done) => {
          chai.request(server)
            .put('/api/v1/profiles')
            .set('x-access-token', validToken)
            .type('application/json')
            .send({
              username: user.emptyPassword.username,
              address: user.address,
              location: user.location,
              stack: user.stack,
              developer: user.developer
            })
            .end((err, res) => {
              res.should.have.status(200);
              assert.equal(true, res.body.success);
              res.body.should.have.property('message')
                .equals('Profile updated successfully');
              done();
            });
        }
      );
      it(`should return status code 401 when user try to update profile
        with invalid token`, (done) => {
        const invalid = validToken.slice(0, -1);
        chai.request(server)
          .put('/api/v1/profiles')
          .set('x-access-token', invalid)
          .type('application/json')
          .send({
            email: user.email,
            username: user.username
          })
          .end((err, res) => {
            res.should.have.status(401);
            res.body.should.have.property('name')
              .equals('JsonWebTokenError');
            res.body.should.have.property('message')
              .equals('invalid signature');
            done();
          });
      });

      it('should return user not found for with invalid _id', (done) => {
        const id_ = user._id;
        chai.request(server)
          .get(`/api/v1/developer/${id_}`)
          .set('x-access-token', validToken)
          .type('application/json')
          .end((err, res) => {
            res.should.have.status(404);
            res.body.should.have.property('message')
              .equals('Invalid user id');
            done();
          });
      });

      it('should return status code 200 on success', (done) => {
        chai.request(server)
          .get(`/api/v1/developer/${id}`)
          .set('x-access-token', validToken)
          .type('application/json')
          .end((err, res) => {
            res.should.have.status(200);
            assert.equal(id, res.body.user._id);
            done();
          });
      });

      it('should be able to search for developers', (done) => {
        chai.request(server)
          .get('/api/v1/developers')
          .set('x-access-token', validToken)
          .type('application/json')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.have.property('developers');
            res.body.should.have.property('pageInfo');
            done();
          });
      });
      it('should be able to search for developers base on stack', (done) => {
        const developer = user.backend;
        chai.request(server)
          .get(`/api/v1/developers?developers=${developer}&offset=0&limit=10`)
          .set('x-access-token', validToken)
          .type('application/json')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.have.property('developers');
            res.body.should.have.property('pageInfo');
            done();
          });
      });
      it('should return 401 for invalid credential', (done) => {
        const userId = user._id;
        chai.request(server)
          .delete(`/api/v1/developers/${userId}`)
          .set('x-access-token', validToken)
          .set('Content-Type', 'application/json')
          .end((err, res) => {
            res.should.have.status(401);
            assert.equal(res.body.success, false);
            assert.equal(
              'User`s not authorized to perform this operation',
              res.body.error
            );
            done();
          });
      });
      it('should return 403 without a valid token', (done) => {
        const userId = user._id;
        chai.request(server)
          .delete(`/api/v1/developers/${userId}`)
          .set('Content-Type', 'application/json')
          .end((err, res) => {
            res.should.have.status(403);
            assert.equal('No valid token provided', res.body.error);
            done();
          });
      });
      it(`should return 401 for an expired token supplied
      to delete an account`, (done) => {
        const userId = user._id;
        const expiredToken = { user };
        chai.request(server)
          .delete(`/api/v1/developers/${userId}`)
          .set('x-access-token', expiredToken)
          .set('Content-Type', 'application/json')
          .end((err, res) => {
            res.should.have.status(401);
            assert.equal('JsonWebTokenError', res.body.name);
            assert.equal('jwt malformed', res.body.message);
            done();
          });
      });
      it('should allow user`s to delete account', (done) => {
        chai.request(server)
          .delete(`/api/v1/developers/${id}`)
          .set('x-access-token', validToken)
          .set('Content-Type', 'application/json')
          .end((err, res) => {
            res.should.have.status(202);
            assert.equal(res.body.success, true);
            assert.equal('Account deleted successfully', res.body.message);
            done();
          });
      });
    });
  });
});
