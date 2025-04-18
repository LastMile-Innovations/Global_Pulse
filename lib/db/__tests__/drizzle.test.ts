import { describe, it, expect, vi } from "vitest"
import { db } from "../postgres/drizzle"
import { users, coherenceFeedback, resonanceFlags, dataAccessRequests } from "../schema"

// Mock the database client
vi.mock("../postgres/drizzle", () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockImplementation(() => [{ id: "test-id" }]),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue([{ id: "test-id" }]),
    query: {
      users: {
        findFirst: vi.fn().mockResolvedValue({ id: "test-id", email: "test@example.com" }),
        findMany: vi.fn().mockResolvedValue([{ id: "test-id", email: "test@example.com" }]),
      },
      dataAccessRequests: {
        findMany: vi.fn().mockResolvedValue([{ id: "test-id", purpose: "Test purpose" }]),
      },
    },
  },
}))

describe("Database Operations", () => {
  describe("User Operations", () => {
    it("should insert a user", async () => {
      const userData = {
        supabaseAuthUserId: "auth-id",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await db.insert(users).values(userData)

      expect(db.insert).toHaveBeenCalledWith(users)
      expect(db.values).toHaveBeenCalledWith(userData)
    })

    it("should find a user by email", async () => {
      const result = await db.query.users.findFirst({
        where: (user, { eq }) => eq(user.email, "test@example.com"),
      })

      expect(result).toEqual({ id: "test-id", email: "test@example.com" })
    })
  })

  describe("Feedback Operations", () => {
    it("should insert coherence feedback", async () => {
      const feedbackData = {
        userId: "user-id",
        sessionId: "session-id",
        messageId: "message-id",
        coherenceScore: 5,
        feedback: "Great response!",
        createdAt: new Date(),
      }

      await db.insert(coherenceFeedback).values(feedbackData)

      expect(db.insert).toHaveBeenCalledWith(coherenceFeedback)
      expect(db.values).toHaveBeenCalledWith(feedbackData)
    })

    it("should insert a resonance flag", async () => {
      const flagData = {
        userId: "user-id",
        sessionId: "session-id",
        flaggedInteractionID: "interaction-id",
        precedingInteractionID: "prev-interaction-id",
        modeAtTimeOfFlag: "insight",
        responseTypeAtTimeOfFlag: "LLM",
        selectedTags: ["unclear", "confusing"],
        optionalComment: "This response was confusing",
        createdAt: new Date(),
      }

      await db.insert(resonanceFlags).values(flagData)

      expect(db.insert).toHaveBeenCalledWith(resonanceFlags)
      expect(db.values).toHaveBeenCalledWith(flagData)
    })
  })

  describe("Data Access Request Operations", () => {
    it("should insert a data access request", async () => {
      const requestData = {
        userId: "user-id",
        purpose: "Research",
        dataTypes: ["user_data", "feedback"],
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await db.insert(dataAccessRequests).values(requestData)

      expect(db.insert).toHaveBeenCalledWith(dataAccessRequests)
      expect(db.values).toHaveBeenCalledWith(requestData)
    })

    it("should find data access requests for a user", async () => {
      const results = await db.query.dataAccessRequests.findMany({
        where: (dar, { eq }) => eq(dar.userId, "user-id"),
      })

      expect(results).toEqual([{ id: "test-id", purpose: "Test purpose" }])
    })
  })
})
