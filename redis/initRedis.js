import { createClient } from "redis";

import logger from "../utils/logger.js";

const client = createClient();

client.on("connect", () => {
  logger.log.success("Connected to redis server!!!");
});

client.on("ready", () => {
  logger.log.success("Redis is ready to use!!!");
});

client.on("error", (err) => {
  logger.log.error(err.message);
});

client.on("end", () => {
  logger.log.warn("Disconnected from redis!!!");
});

await client.connect();

process.on("SIGINT", async () => {
  await client.quit();
  process.exit(0);
});

export default client;
