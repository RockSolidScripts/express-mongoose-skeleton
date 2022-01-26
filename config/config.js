// * Import NPM Modules
import dotenv from "dotenv";
import joi from "joi";

// * Import local JS files
import logger from "../utils/logger.js";

dotenv.config();

// ? Define ENV file schema using "JOI"
const envSchema = joi
  .object()
  .keys({
    NODE_ENV: joi.string().valid("development", "production").required(),
    PORT: joi.number().positive().required(),
    ALLOWED_ORIGINS: joi.string().required(),
    MONGO_DB_URI: joi.string().required(),
    MONGO_DB_NAME: joi.string().required(),
    JWT_ACCESS_SECRET: joi.string().required(),
    JWT_REFRESH_SECRET: joi.string().required(),
    JWT_ACCESS_EXPIRY: joi.string().required(),
    JWT_REFRESH_EXPIRY: joi.string().required(),
    REDIS_REFRESH_TOKEN_EXPIRY: joi.string().required(),
  })
  .unknown();

// ? Validate ENV file using "JOI"
const { value: env, error } = envSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);
if (error)
  logger.log.error(
    new Error(
      `ENV Validation Error -> ${error.message}!!! Please check the ENV File...`
    )
  );

// * Export the necessary ENV Variables
export default {
  NODE_ENV: env.NODE_ENV,
  PORT: env.PORT,
  ALLOWED_ORIGINS: env.ALLOWED_ORIGINS.split(",") || "*",
  DB_URI: env.MONGO_DB_URI,
  DB_NAME: env.MONGO_DB_NAME,
  JWT_ACCESS_SECRET: env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRY: env.JWT_ACCESS_EXPIRY,
  JWT_REFRESH_EXPIRY: env.JWT_REFRESH_EXPIRY,
  REDIS_REFRESH_TOKEN_EXPIRY: env.REDIS_REFRESH_TOKEN_EXPIRY,
};
