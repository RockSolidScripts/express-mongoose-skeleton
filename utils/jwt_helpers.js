import JWT from "jsonwebtoken";
import httpErrors from "http-errors";

import config from "../config/config.js";
import { USER_UNAUTHORIZED } from "./constants.js";
import redisClient from "../redis/initRedis.js";

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

      if (exp === config.JWT_REFRESH_EXPIRY) {
        redisClient.SET(
          userId.toString(),
          token,
          { EX: 15 * 24 * 60 * 60 },
          (err, _) => {
            console.log(err);
            if (err) return reject(httpErrors.InternalServerError());
            resolve(token);
          }
        );
      }
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
      redisClient
        .GET(userId)
        .then((res) => {
          if (res === refresh_token) return resolve(userId);
          reject(httpErrors.Unauthorized());
        })
        .catch((err) => {
          console.log(err);
          reject(httpErrors.InternalServerError());
        });
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
