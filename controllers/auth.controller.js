// * Import NPM Modules
import httpErrors from "http-errors";

// * Import local JS files
import { UserModel } from "../models/user.model.js";

const login = async (req, res, next) => {
  res.status(200).send({
    message: "Handle login",
  });
};

const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw httpErrors.BadRequest();

    const userExists = await UserModel.findOne({ email });
    if (userExists)
      throw httpErrors.Conflict(`${email} is already registered!!!`);

    const registerUser = await UserModel.create({ email, password });

    res.status(200).send({
      status: 200,
      data: registerUser,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  login,
  register,
};
