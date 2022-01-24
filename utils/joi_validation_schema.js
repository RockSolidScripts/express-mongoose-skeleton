import Joi from "joi";

export const registerSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).required(),
  first_name: Joi.string().alphanum().required(),
  dob: Joi.date().greater("1-1-1920").required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).required(),
});
