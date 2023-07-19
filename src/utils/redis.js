import dotenv from "dotenv";
import * as redis from "redis";

dotenv.config();

export const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    db:process.env.REDIS_DB
});