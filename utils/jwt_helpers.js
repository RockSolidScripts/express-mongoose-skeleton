import JWT from "jsonwebtoken";
import httpErrors from "http-errors";

export const signJwtToken = (userId, secret, exp) => {
  return new Promise((resolve, reject) => {
    const payload = {};
    const options = {
      expiresIn: exp,
      issuer: "rocksolidscripts@abc.com",
      audience: userId.toString(),
    };
    JWT.sign(payload, secret, options, (err, token) => {
      if (err) return reject(err);
      resolve(token);
    });
  });
};
