// * Import NPM Modules
import httpErrors from "http-errors";

// * Import local JS files
import { UserModel } from "../models/user.model.js";
import { registerSchema, loginSchema } from "../utils/joi_validation_schema.js";
import { signJwtToken } from "../utils/jwt_helpers.js";
import config from "../config/config.js";
import {
  EMAIL_ALREADY_REGISTERED,
  EMAIL_NOT_REGISTERED,
  INVALID_USERNAME_OR_PASSWORD,
} from "../utils/constants.js";

const login = async (req, res, next) => {
  try {
    const { email, password } = await loginSchema.validateAsync(req.body);

    const userExists = await UserModel.findOne({ email });
    if (!userExists)
      throw httpErrors.NotFound(`${email} - ${EMAIL_NOT_REGISTERED}`);

    const isMatch = await userExists.isValidPassword(password);
    if (!isMatch) throw httpErrors.Unauthorized(INVALID_USERNAME_OR_PASSWORD);

    const accessToken = await signJwtToken(
      userExists._id,
      config.JWT_ACCESS_SECRET,
      config.JWT_ACCESS_EXPIRY
    );

    res.status(200).send({
      status: 200,
      access_token: accessToken,
    });
  } catch (error) {
    if (error.isJoi)
      return next(httpErrors.BadRequest(INVALID_USERNAME_OR_PASSWORD));
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const validatedResult = await registerSchema.validateAsync(req.body);
    const { email } = validatedResult;

    const userExists = await UserModel.findOne({ email });
    if (userExists)
      throw httpErrors.Conflict(`${email} - ${EMAIL_ALREADY_REGISTERED}`);

    const registeredUser = await UserModel.create(validatedResult);
    const accessToken = await signJwtToken(
      registeredUser._id,
      config.JWT_ACCESS_SECRET,
      config.JWT_ACCESS_EXPIRY
    );

    res.status(200).send({
      status: 200,
      access_token: accessToken,
    });
  } catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
};

export default {
  login,
  register,
};
