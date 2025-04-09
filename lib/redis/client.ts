import { Redis, type RedisConfigNodejs } from "@upstash/redis"

/**
 * High-performance Redis client for Next.js applications
 * 
 * Optimized for:
 * - Maximum performance with separate read/write clients
 * - Dead simple API with automatic JSON serialization
 * - Edge Runtime compatibility
 * - Efficient tag-based cache invalidation
 * - Resilient error handling with exponential backoff
 * - Upstash best practices for basic plan
 */

// --- Configuration ---

// Define specific environment variable names for clarity
const primaryUrl = process.env.UPSTASH_REDIS_PRIMARY_URL || process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const primaryToken = process.env.UPSTASH_REDIS_PRIMARY_TOKEN || process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
const replicaUrl = process.env.UPSTASH_REDIS_REPLICA_URL || primaryUrl; // Fallback to primary if no replica specified
const replicaToken = process.env.UPSTASH_REDIS_REPLICA_TOKEN || primaryToken; // Fallback to primary if no replica specified

// Early exit if primary credentials are missing
if (!primaryUrl || !primaryToken) {
  throw new Error(
    "Missing Upstash Redis primary credentials. Please set UPSTASH_REDIS_PRIMARY_URL and UPSTASH_REDIS_PRIMARY_TOKEN environment variables."
  )
}

// Shared configuration for both clients
const redisConfig: Partial<RedisConfigNodejs> = {
  // Essential for Edge Runtime & Serverless performance
  enableAutoPipelining: true,
  // Simplifies common use cases by handling JSON automatically
  automaticDeserialization: true,
  // Sensible defaults for edge/serverless: fail relatively fast
  retry: {
    retries: 3,
    backoff: (retryCount: number) => Math.min(Math.exp(retryCount) * 50, 1000), // Exponential backoff up to 1s
  },
  // Disable verbose logging in production for performance
  latencyLogging: process.env.NODE_ENV === "development",
}

/**
 * Upstash Redis Client for WRITE operations (and commands not safe on replicas).
 * Connects to the primary Redis instance.
 * Use this for: SET, DEL, INCR, DECR, HSET, HDEL, ZADD, ZREM, SADD, SREM, PUBLISH, Pipelined writes, Transactions (MULTI/EXEC).
 * Also use for read commands that MUST see the absolute latest data if not using Global DB eventual consistency.
 */
export const redisPrimary = new Redis({
  url: primaryUrl,
  token: primaryToken,
  ...redisConfig,
})

/**
 * Upstash Redis Client for READ operations.
 * Connects to the read replica Redis instance (falls back to primary if replica URL/Token aren't set).
 * Use this for: GET, MGET, HGETALL, HMGET, ZRANGE, ZSCORE, SMEMBERS, SCAN variants etc.
 * Ideal for caching reads and leveraging potential Global Database read replicas for lower latency.
 */
export const redisReplica = new Redis({
  url: replicaUrl,
  token: replicaToken,
  ...redisConfig,
})

/**
 * Generates a consistent cache key with an optional parameters object.
 * Parameters are sorted and stringified to ensure key consistency.
 *
 * @param prefix - The base prefix for the key (e.g., 'user', 'posts:list').
 * @param params - Optional object containing parameters to include in the key.
 * @returns A formatted cache key string.
 *
 * @example
 * createCacheKey('user', { id: 123 }) // => "user:{\"id\":123}"
 * createCacheKey('posts:list')       // => "posts:list:default"
 */
export const createCacheKey = (prefix: string, params: Record<string, unknown> = {}): string => {
  const sortedEntries = Object.entries(params).sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

  if (sortedEntries.length === 0) {
    return `${prefix}:default`;
  }

  // Stable stringify ensures consistent key despite object property order differences
  const paramsString = JSON.stringify(Object.fromEntries(sortedEntries));
  return `${prefix}:${paramsString}`;
}

// --- Caching Abstraction ---

type CacheOptions = {
  /** Time-to-live in seconds. Defaults to 60 seconds. */
  ttl?: number;
  /** Optional array of tags for tag-based invalidation. */
  tags?: string[];
}

/**
 * Fetches data from cache or executes a query function, caching the result.
 * Optimized for performance with pipelining for tag management.
 * Uses read replica for cache checks and primary for writes.
 * Relies on automatic JSON serialization/deserialization.
 *
 * @template T The expected type of the data.
 * @param key The cache key. Use `createCacheKey` for complex keys.
 * @param queryFn An async function that fetches the data if not found in cache.
 * @param options Cache options including TTL and tags.
 * @returns A promise resolving to the cached or fetched data.
 *
 * @example
 * const user = await cacheQuery<User>(
 *   createCacheKey('user', { id: userId }),
 *   () => db.query.users.findFirst({ where: eq(users.id, userId) }),
 *   { ttl: 300, tags: [`user:${userId}`, 'users'] }
 * );
 */
export async function cacheQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  options: CacheOptions = {},
): Promise<T> {
  const { ttl = 60, tags = [] } = options;

  try {
    // 1. Check cache using the read replica client
    const cachedData = await redisReplica.get<T>(key);

    if (cachedData !== null && cachedData !== undefined) {
      // Cache hit - return immediately
      return cachedData;
    }

    // 2. Cache miss - execute the query function
    const data = await queryFn();

    // 3. Store result in cache using the primary client (write operation)
    // Use SETEX for atomic set + expire. automaticDeserialization handles stringify.
    const setPromise = redisPrimary.setex(key, ttl, data);

    // 4. If tags are provided, add key to tag sets using a pipeline on the primary client
    let tagPipelinePromise: Promise<unknown> | null = null;
    if (tags.length > 0) {
      const uniqueTags = [...new Set(tags)]; // Ensure tags are unique
      const p = redisPrimary.pipeline();
      uniqueTags.forEach(tag => {
        if (tag) { // Avoid adding empty tags
            p.sadd(`tag:${tag}`, key);
        }
      });
      // Check if there are any commands to execute
      tagPipelinePromise = p.exec();
    }

    // Wait for cache set and tag operations to complete (auto-pipelining helps if separate awaits)
    // Using Promise.all ensures they run concurrently where possible by the client/env
    await Promise.all([setPromise, tagPipelinePromise].filter(p => p !== null));

    return data;

  } catch (error) {
    console.error(`Redis cache error for key ${key}. Falling back to direct query.`, error);
    // Fallback to direct query on any cache error for resilience
    try {
      return await queryFn();
    } catch (queryError) {
      console.error(`Direct query failed after cache error for key ${key}.`, queryError);
      // Re-throw the original query error if fallback also fails
      throw queryError;
    }
  }
}

/**
 * Invalidates cache entries associated with one or more tags.
 * Efficiently removes keys from Redis using pipelining.
 * Uses read replica to get keys and primary to delete.
 *
 * @param tags - A single tag or an array of tags to invalidate.
 *
 * @example
 * await invalidateTags('users');
 * await invalidateTags([`user:${userId}`, `posts:user:${userId}`]);
 */
export async function invalidateTags(tags: string | string[]): Promise<void> {
  const tagList = Array.isArray(tags) ? tags : [tags];
  const uniqueTags = [...new Set(tagList)].filter(tag => tag); // Ensure unique and non-empty

  if (uniqueTags.length === 0) return;

  const tagKeys = uniqueTags.map(tag => `tag:${tag}`);

  try {
    // 1. Get all keys associated with these tags using the read replica client
    // Use SUNION for efficiency if needing keys from multiple tags at once
    // Handle type conversion for sunion
    const keysToInvalidate = await redisReplica.sunion(tagKeys as unknown as string);

    if (keysToInvalidate.length > 0) {
      // 2. Delete all cache keys AND the tag sets themselves using a pipeline on the primary client
      const p = redisPrimary.pipeline();
      // Delete each key individually to avoid type errors
      keysToInvalidate.forEach(key => {
        if (typeof key === 'string') {
          p.del(key);
        }
      });
      // Delete tag keys
      tagKeys.forEach(tagKey => p.del(tagKey));
      await p.exec();
    }
  } catch (error) {
    console.error(`Cache invalidation error for tags: ${uniqueTags.join(', ')}`, error);
    // Don't throw here, invalidation failure is often recoverable (stale cache)
  }
}

/**
 * Publishes a message to a Redis channel.
 * Automatically serializes non-string data to JSON.
 * Uses the primary client for publishing. Includes basic retry logic.
 *
 * @param channel - The channel name to publish to.
 * @param data - The data to publish (will be JSON.stringified if not a string).
 * @returns A promise resolving to true if publish was likely successful, false otherwise.
 */
export async function publishUpdate(channel: string, data: unknown): Promise<boolean> {
  let retries = 0;
  const maxRetries = 2; // Keep retries low for edge

  while (retries <= maxRetries) {
    try {
      // Convert data to string if needed (automaticDeserialization doesn't apply to publish)
      const dataToPublish = typeof data === 'string' ? data : JSON.stringify(data);
      // Type assertion needed because publish expects string
      await redisPrimary.publish(channel, dataToPublish as string);
      return true; // Assume success if no error
    } catch (error) {
      retries++;
      if (retries > maxRetries) {
        console.error(`Redis publish error (after ${retries} attempts) for channel ${channel}:`, error);
        return false;
      }
      // Simple exponential backoff before retrying
      const delay = Math.min(100 * Math.pow(2, retries), 500); // Shorter max delay for edge
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return false; // Should not be reached if maxRetries >= 0
}

/**
 * Rate Limiting is recommended using the official @upstash/ratelimit package.
 * It offers various algorithms (Sliding Window recommended), edge optimization,
 * multi-region support, and ephemeral caching.
 *
 * @example Implement in Middleware or Server Actions/API Routes:
 *
 * import { Ratelimit } from "@upstash/ratelimit";
 * import { redisPrimary } from "@/lib/redis/client"; // Use primary for rate limit state writes
 *
 * const ratelimit = new Ratelimit({
 *   redis: redisPrimary,
 *   limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
 *   analytics: true, // Enable analytics (optional)
 *   prefix: "@upstash/ratelimit", // Namespace keys in Redis
 *   // Consider enabling ephemeralCache for high traffic endpoints in serverless
 *   // ephemeralCache: new Map(),
 * });
 *
 * // In your Middleware or handler:
 * const identifier = request.ip ?? '127.0.0.1'; // Or user ID, API key etc.
 * const { success, limit, remaining, reset, pending } = await ratelimit.limit(identifier);
 *
 * // For Vercel Edge Functions / Middleware: ensure analytics promise completes
 * if ('waitUntil' in context) { // context is the 2nd arg in Middleware/Edge handler
 *   context.waitUntil(pending);
 * }
 *
 * if (!success) {
 *   return new Response("Rate limit exceeded", { status: 429 });
 * }
 * // Proceed with request...
 */

// Legacy exports for backward compatibility
export const redis = redisPrimary;

// Note: Consider adding more specific helper functions for common Redis patterns
// relevant to your application (e.g., leaderboard updates, session management checks)
// using the exported `redisPrimary` and `redisReplica` clients.




