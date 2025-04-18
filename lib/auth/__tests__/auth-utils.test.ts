import { NextRequest } from "next/server"
import { auth, isAdmin } from "../auth-utils"
import { db } from "@/lib/db/drizzle"
import { logger } from "@/lib/utils/logger"
import { describe, beforeEach, it, expect, jest } from "@jest/globals"

// Mock dependencies
jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
}))

jest.mock("../auth-utils", () => ({
  auth: jest.fn(),
  isAdmin: jest.requireActual("../auth-utils").isAdmin,
}))

jest.mock("@/lib/db/drizzle", () => ({
  db: {
    query: {
      users: {
        findFirst: jest.fn(),
      },
    },
  },
}))

jest.mock("@/lib/utils/logger", () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}))

describe("auth-utils", () => {
  let mockRequest: NextRequest

  beforeEach(() => {
    mockRequest = new NextRequest(new Request("https://example.com"))
    jest.clearAllMocks()
  })

  describe("isAdmin", () => {
    it("should return false if user is not authenticated", async () => {
      // Mock auth to return null (unauthenticated)
      ;(auth as jest.Mock).mockResolvedValue(null)

      const result = await isAdmin(mockRequest)

      expect(auth).toHaveBeenCalledWith(mockRequest)
      expect(result).toBe(false)
      expect(db.query.users.findFirst).not.toHaveBeenCalled()
    })

    it("should return true if user has admin role", async () => {
      // Mock auth to return a user ID
      const mockUserId = "user-123"
      ;(auth as jest.Mock).mockResolvedValue(mockUserId)

      // Mock DB query to return a user with admin role
      ;(db.query.users.findFirst as jest.Mock).mockResolvedValue({
        role: "admin",
      })

      const result = await isAdmin(mockRequest)

      expect(auth).toHaveBeenCalledWith(mockRequest)
      expect(db.query.users.findFirst).toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it("should return false if user has non-admin role", async () => {
      // Mock auth to return a user ID
      const mockUserId = "user-123"
      ;(auth as jest.Mock).mockResolvedValue(mockUserId)

      // Mock DB query to return a user with non-admin role
      ;(db.query.users.findFirst as jest.Mock).mockResolvedValue({
        role: "user",
      })

      const result = await isAdmin(mockRequest)

      expect(auth).toHaveBeenCalledWith(mockRequest)
      expect(db.query.users.findFirst).toHaveBeenCalled()
      expect(result).toBe(false)
    })

    it("should return false if user exists in auth but not in DB", async () => {
      // Mock auth to return a user ID
      const mockUserId = "user-123"
      ;(auth as jest.Mock).mockResolvedValue(mockUserId)

      // Mock DB query to return null (user not found in DB)
      ;(db.query.users.findFirst as jest.Mock).mockResolvedValue(null)

      const result = await isAdmin(mockRequest)

      expect(auth).toHaveBeenCalledWith(mockRequest)
      expect(db.query.users.findFirst).toHaveBeenCalled()
      expect(logger.warn).toHaveBeenCalled()
      expect(result).toBe(false)
    })

    it("should return false and log error if DB query fails", async () => {
      // Mock auth to return a user ID
      const mockUserId = "user-123"
      ;(auth as jest.Mock).mockResolvedValue(mockUserId)

      // Mock DB query to throw an error
      const mockError = new Error("Database connection failed")
      ;(db.query.users.findFirst as jest.Mock).mockRejectedValue(mockError)

      const result = await isAdmin(mockRequest)

      expect(auth).toHaveBeenCalledWith(mockRequest)
      expect(db.query.users.findFirst).toHaveBeenCalled()
      expect(logger.error).toHaveBeenCalled()
      expect(result).toBe(false)
    })
  })
})
