import { Redis } from "@upstash/redis"
import { logger } from "../../utils/logger"

let redisClient: Redis | null = null

/**
 * Get or create a Redis client instance
 */
export function getRedisClient(): Redis {
  if (redisClient) {
    return redisClient
  }

  const url = process.env.REDIS_URL || process.env.KV_URL
  const token = process.env.KV_REST_API_TOKEN

  if (!url || !token) {
    const error = "Redis connection details missing from environment variables"
    logger.error(error)
    throw new Error(error)
  }

  try {
    redisClient = new Redis({
      url,
      token,
    })

    logger.info("Redis client created successfully")
    return redisClient
  } catch (error) {
    logger.error(`Error creating Redis client: ${error}`)
    throw error
  }
}
