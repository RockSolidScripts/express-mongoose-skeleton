import JWT from "jsonwebtoken";
import httpErrors from "http-errors";

import config from "../config/config.js";
import { USER_UNAUTHORIZED } from "./constants.js";

const signJwtToken = (userId, secret, exp) => {
  return new Promise((resolve, reject) => {
    const payload = {};
    const options = {
      expiresIn: exp,
      issuer: "rocksolidscripts@abc.com",
      audience: userId.toString(),
    };
    JWT.sign(payload, secret, options, (err, token) => {
      if (err) return reject(httpErrors.InternalServerError());
      resolve(token);
    });
  });
};

export const verifyAccessToken = (req, _, next) => {
  const { authorization: authorizationHeader } = req.headers;
  if (!authorizationHeader) return next(httpErrors.Unauthorized());

  const token = authorizationHeader.split(" ")[1];

  JWT.verify(token, config.JWT_ACCESS_SECRET, (err, payload) => {
    if (err) {
      const message =
        err.name === "JsonWebTokenError" ? USER_UNAUTHORIZED : err.message;
      return next(httpErrors.Unauthorized(message));
    }

    req.payload = payload;
    next();
  });
};

export const verifyRefreshToken = (refresh_token) => {
  return new Promise((resolve, reject) => {
    JWT.verify(refresh_token, config.JWT_REFRESH_SECRET, (err, payload) => {
      if (err) return reject(httpErrors.Unauthorized());
      const userId = payload.aud;

      resolve(userId);
    });
  });
};

export const createAccessAndRefreshToken = async (user_id) => {
  const accessToken = await signJwtToken(
    user_id,
    config.JWT_ACCESS_SECRET,
    config.JWT_ACCESS_EXPIRY
  );
  const refreshToken = await signJwtToken(
    user_id,
    config.JWT_REFRESH_SECRET,
    config.JWT_REFRESH_EXPIRY
  );
  return { access_token: accessToken, refresh_token: refreshToken };
};
