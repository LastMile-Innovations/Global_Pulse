import {
  getEngagementMode,
  setEngagementMode,
  isInsightModeActive,
  isListeningModeActive,
  resetEngagementMode,
  DEFAULT_ENGAGEMENT_MODE,
} from "../mode-manager"
import { getRedisClient } from "../../db/redis/redis-client"
import { describe, beforeEach, test, expect, jest } from "@jest/globals"

// Mock Redis client
jest.mock("../../db/redis/redis-client")

describe("Mode Manager", () => {
  beforeEach(() => {
    jest.resetAllMocks()

    // Mock Redis client methods
    const mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    }
    ;(getRedisClient as jest.Mock).mockReturnValue(mockRedis)
  })

  describe("getEngagementMode", () => {
    test("should return mode from Redis if it exists", async () => {
      // Mock Redis to return a mode
      const mockRedis = getRedisClient() as any
      mockRedis.get.mockResolvedValue("insight")

      const mode = await getEngagementMode("test-user", "test-session")
      expect(mode).toBe("insight")
      expect(mockRedis.get).toHaveBeenCalled()
    })

    test("should set and return default mode if not found in Redis", async () => {
      // Mock Redis to return null (mode not found)
      const mockRedis = getRedisClient() as any
      mockRedis.get.mockResolvedValue(null)

      const mode = await getEngagementMode("test-user", "test-session")
      expect(mode).toBe(DEFAULT_ENGAGEMENT_MODE)
      expect(mockRedis.set).toHaveBeenCalled()
    })

    test("should handle Redis errors gracefully", async () => {
      // Mock Redis to throw an error
      const mockRedis = getRedisClient() as any
      mockRedis.get.mockRejectedValue(new Error("Redis error"))

      const mode = await getEngagementMode("test-user", "test-session")
      expect(mode).toBe(DEFAULT_ENGAGEMENT_MODE)
    })
  })

  describe("setEngagementMode", () => {
    test("should set mode in Redis", async () => {
      // Mock Redis set method
      const mockRedis = getRedisClient() as any
      mockRedis.set.mockResolvedValue("OK")

      const result = await setEngagementMode("test-user", "test-session", "listening")
      expect(result).toBe(true)
      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.stringContaining("test-session"),
        "listening",
        expect.anything(),
      )
    })

    test("should handle Redis errors gracefully", async () => {
      // Mock Redis to throw an error
      const mockRedis = getRedisClient() as any
      mockRedis.set.mockRejectedValue(new Error("Redis error"))

      const result = await setEngagementMode("test-user", "test-session", "listening")
      expect(result).toBe(false)
    })
  })

  describe("isInsightModeActive", () => {
    test("should return true if mode is insight", async () => {
      // Mock getEngagementMode to return insight
      const mockRedis = getRedisClient() as any
      mockRedis.get.mockResolvedValue("insight")

      const result = await isInsightModeActive("test-user", "test-session")
      expect(result).toBe(true)
    })

    test("should return false if mode is not insight", async () => {
      // Mock getEngagementMode to return listening
      const mockRedis = getRedisClient() as any
      mockRedis.get.mockResolvedValue("listening")

      const result = await isInsightModeActive("test-user", "test-session")
      expect(result).toBe(false)
    })
  })

  describe("isListeningModeActive", () => {
    test("should return true if mode is listening", async () => {
      // Mock getEngagementMode to return listening
      const mockRedis = getRedisClient() as any
      mockRedis.get.mockResolvedValue("listening")

      const result = await isListeningModeActive("test-user", "test-session")
      expect(result).toBe(true)
    })

    test("should return false if mode is not listening", async () => {
      // Mock getEngagementMode to return insight
      const mockRedis = getRedisClient() as any
      mockRedis.get.mockResolvedValue("insight")

      const result = await isListeningModeActive("test-user", "test-session")
      expect(result).toBe(false)
    })
  })

  describe("resetEngagementMode", () => {
    test("should reset mode to default", async () => {
      // Mock Redis set method
      const mockRedis = getRedisClient() as any
      mockRedis.set.mockResolvedValue("OK")

      await resetEngagementMode("test-user", "test-session")
      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.stringContaining("test-session"),
        DEFAULT_ENGAGEMENT_MODE,
        expect.anything(),
      )
    })

    test("should handle Redis errors gracefully", async () => {
      // Mock Redis to throw an error
      const mockRedis = getRedisClient() as any
      mockRedis.set.mockRejectedValue(new Error("Redis error"))

      // Should not throw
      await expect(resetEngagementMode("test-user", "test-session")).resolves.not.toThrow()
    })
  })
})
