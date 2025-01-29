import Redis, { Redis as RedisClient }  from "ioredis";

class RedisSingleton {
  private static instance: Redis;

  private constructor() {}

  public static getInstance(): Redis {
    if (!RedisSingleton.instance) {
      RedisSingleton.instance = new Redis({
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: Number(process.env.REDIS_PORT) || 6379,
      });

      RedisSingleton.instance.on("connect", () => console.log("Connected to Redis"));
      RedisSingleton.instance.on("error", (err) => console.error("Redis error:", err));
    }
    return RedisSingleton.instance;
  }
}

export const redisClient: RedisClient = RedisSingleton.getInstance();
