// * Import NPM Modules
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

// * Import local JS files
import config from "./config/config.js";
import logger from "./utils/logger.js";
import errors from "./utils/errors.js";
import routes from "./routes/index.js";
import connectDb from "./mongo/initDb.js";
import redisClient from "./redis/initRedis.js";
import { verifyAccessToken } from "./utils/jwt_helpers.js";

const app = express();
const { PORT } = config;

// * Connect to MongoDb
connectDb();

// * Express Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(logger.middleware);
app.use(helmet());
app.use(
  cors({
    origin: config.ALLOWED_ORIGINS,
  })
);

// * Test route
app.get("/", verifyAccessToken, (req, res) => {
  res.status(200).send({
    message: "From Express!!!",
  });
});

app.use("/api/v1", routes);

// * PageNotFound error handler
app.use(errors.pathNotFound);

// * Error Handler
app.use(errors.errorHandler);

app.listen(PORT, () => {
  logger.log.success(`Server is running on PORT ${PORT}`);
});
