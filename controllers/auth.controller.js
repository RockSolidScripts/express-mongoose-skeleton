// * Import NPM Modules
import httpErrors from "http-errors";

// * Import local JS files
import { UserModel } from "../models/user.model.js";
import registerSchema from "../utils/joi_validation_schema.js";

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

    const registerUser = await UserModel.create({ email, password });

    res.status(200).send({
      status: 200,
      data: registerUser,
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
