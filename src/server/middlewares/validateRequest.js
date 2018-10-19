
/**
 * validate - description
 * @param  {object} request the form data to be validated
 * @return {object}  {} containing error and isValid
 */
const validateRequestBody = (request) => {
  if (Object.hasOwnProperty.call(request, 'body')) {
    for (const key in request.body) {
      switch (key) {
        case 'username':
          request.check('username', 'Username field cannot be empty')
            .trim()
            .notEmpty()
            .matches(/\w/);
          request.check('username', 'Username must be more than 2 characters')
            .trim()
            .isLength(2, 50);
          break;

        case 'email':
          request.check('email', 'Email address field cannot be empty')
            .trim()
            .notEmpty();

          request.check('email', 'Email is badly formatted')
            .trim()
            .isEmail();
          break;

        case 'password':
          request.check('password', 'Password field cannot be empty')
            .trim()
            .notEmpty();
          request.check(
            'password',
            'Password length must be more than 6 characters'
          )
            .trim()
            .isLength({ min: 7 }).matches(/\w/);
          break;

        case 'newPassword':
          request.check('newPassword', 'newPassword field cannot be empty')
            .trim()
            .notEmpty();
          request.check(
            'newPassword',
            'newPassword length must be more than 6 characters'
          )
            .trim()
            .isLength({ min: 7 }).matches(/\w/);
          break;

        case 'confirmPassword':
          request.check(
            'confirmPassword',
            'confirmPassword field cannot be empty'
          )
            .trim()
            .notEmpty();
          break;

        case 'stack':
          request.check(
            'stack',
            'Stack field cannot be empty'
          )
            .trim()
            .notEmpty();
          request.check(
            'stack',
            'Stack must not be more than 100 characters'
          )
            .isLength({ max: 100 });
          request.check(
            'stack',
            'Stack should contain only alphabets'
          )
            .trim()
            .matches(/\w/);
          break;

        case 'location':
          request.check(
            'location',
            'Lategory field cannot be empty'
          )
            .trim()
            .notEmpty();
          request.check(
            'location',
            'Location must not be more than 50 characters'
          )
            .isLength({ max: 50 });
          request.check(
            'location',
            'Location should contain only alphabets'
          )
            .trim()
            .matches(/\w/);
          break;

        case 'developer':
          request.check(
            'developer',
            'developer field cannot be empty'
          )
            .trim()
            .notEmpty();
          break;

        default:
      }
    }
  }
  return request.validationErrors();
};

/**
 * @description This validates all request inputs
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @function  validateRequest
 * @return {object} return object containing validation error message
 */
const validateRequest = (req, res, next) => {
  const errors = validateRequestBody(req);
  if (errors) {
    const message = errors[0].msg;
    res.status(400).send({ error: message, success: false });
  } else {
    next();
  }
};

export default validateRequest;
