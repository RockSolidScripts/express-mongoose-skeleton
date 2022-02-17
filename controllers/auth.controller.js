// * Import NPM Modules
import httpErrors from "http-errors";

// * Import local JS files
import config from "../config/config.js";
import { UserModel } from "../models/user.model.js";
import redisCLient from "../redis/initRedis.js";
import { registerSchema, loginSchema } from "../utils/joi_validation_schema.js";
import {
  createAccessAndRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt_helpers.js";
import {
  EMAIL_ALREADY_REGISTERED,
  EMAIL_NOT_REGISTERED,
  INVALID_USERNAME_OR_PASSWORD,
  REGISTERED_SUCCESS,
} from "../utils/constants.js";

const login = async (req, res, next) => {
  try {
    const { email, password } = await loginSchema.validateAsync(req.body);

    const userExists = await UserModel.findOne({ email });
    if (!userExists)
      throw httpErrors.NotFound(`${email} - ${EMAIL_NOT_REGISTERED}`);

    const isMatch = await userExists.isValidPassword(password);
    if (!isMatch) throw httpErrors.Unauthorized(INVALID_USERNAME_OR_PASSWORD);

    const { access_token, refresh_token } = await createAccessAndRefreshToken(
      userExists._id
    );

    res.cookie("__refreshToken__", refresh_token, {
      maxAge: 86400000,
      httpOnly: true,
      secure: config.NODE_ENV === "prod" ? true : false,
    });
    res.status(200).send({
      status: 200,
      access_token,
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

    await UserModel.create(validatedResult);

    res.status(200).send({
      status: 200,
      message: REGISTERED_SUCCESS,
    });
  } catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { __refreshToken__: refreshToken } = req.cookies;
    if (!refreshToken) throw httpErrors.BadRequest();

    const userId = await verifyRefreshToken(refreshToken);

    const { access_token, refresh_token } = await createAccessAndRefreshToken(
      userId
    );
    res.cookie("__refreshToken__", refresh_token, {
      maxAge: 86400000,
      httpOnly: true,
      secure: config.NODE_ENV === "prod" ? true : false,
    });
    res.status(200).send({
      status: 200,
      access_token,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { __refreshToken__: refreshToken } = req.cookies;
    if (!refreshToken) throw httpErrors.BadRequest();

    const userId = await verifyRefreshToken(refreshToken);

    await redisCLient.DEL(userId);
    res.cookie("__refreshToken__", "", {
      maxAge: 0,
      httpOnly: true,
      secure: config.NODE_ENV === "prod" ? true : false,
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export default {
  login,
  register,
  refreshToken,
  logout,
};
