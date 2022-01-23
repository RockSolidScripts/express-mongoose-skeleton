// * Import NPM Modules
import httpErrors from "http-errors";

// * Import local JS files
import { UserModel } from "../models/user.model.js";
import registerSchema from "../utils/joi_validation_schema.js";
import { signJwtToken } from "../utils/jwt_helpers.js";
import config from "../config/config.js";

const login = async (req, res, next) => {
  res.status(200).send({
    message: "Handle login",
  });
};

const register = async (req, res, next) => {
  try {
    const { email, password } = await registerSchema.validateAsync(req.body);

    const userExists = await UserModel.findOne({ email });
    if (userExists)
      throw httpErrors.Conflict(`${email} is already registered!!!`);

    const registeredUser = await UserModel.create({ email, password });
    const accessToken = await signJwtToken(
      registeredUser._id,
      config.JWT_ACCESS_SECRET,
      config.JWT_ACCESS_EXPIRY
    );
    res.status(200).send({
      status: 200,
      accessToken,
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
