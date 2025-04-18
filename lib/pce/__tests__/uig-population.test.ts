import { describe, it, expect, vi, beforeEach } from "vitest"
import { updateSelfMapWithInferences } from "../self-map-inference"
import { KgService } from "../../db/graph/kg-service"
import type { InferredAttachment } from "../../types/pce-types"

// Mock dependencies
vi.mock("../../db/graph/kg-service")
vi.mock("../../db/graph/neo4j-driver", () => ({
  getNeo4jDriver: vi.fn(() => ({})),
}))
vi.mock("../../utils/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

describe("UIG Population", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Sample inferred attachments for testing
  const sampleAttachments: InferredAttachment[] = [
    {
      name: "Work-Life Balance",
      type: "VALUE",
      estimatedPL: 8,
      estimatedV: 9,
      certainty: 0.9,
      sourceText: "I really value having a good balance between my work and personal life",
      inferenceMethod: "LLM",
    },
    {
      name: "Career Success",
      type: "GOAL",
      estimatedPL: 7,
      estimatedV: 8,
      certainty: 0.85,
      sourceText: "I want to advance in my career",
      inferenceMethod: "LLM",
    },
  ]

  it("should update the self-map with inferred attachments", async () => {
    // Mock KgService methods
    const mockFindOrCreateAttachmentNode = vi.fn().mockResolvedValue("attachment-123")
    const mockMergeUserAttachment = vi.fn().mockResolvedValue(true)

    // Mock the KgService constructor
    vi.mocked(KgService).mockImplementation(() => {
      return {
        findOrCreateAttachmentNode: mockFindOrCreateAttachmentNode,
        mergeUserAttachment: mockMergeUserAttachment,
      } as unknown as KgService
    })

    const userId = "user123"
    const interactionId = "interaction-456"

    // Call the function
    const result = await updateSelfMapWithInferences(userId, sampleAttachments, interactionId)

    // Verify the result
    expect(result).toBe(2) // Both attachments should be processed successfully

    // Verify that findOrCreateAttachmentNode was called for each attachment
    expect(mockFindOrCreateAttachmentNode).toHaveBeenCalledTimes(2)
    expect(mockFindOrCreateAttachmentNode).toHaveBeenCalledWith("Work-Life Balance", "VALUE")
    expect(mockFindOrCreateAttachmentNode).toHaveBeenCalledWith("Career Success", "GOAL")

    // Verify that mergeUserAttachment was called for each attachment
    expect(mockMergeUserAttachment).toHaveBeenCalledTimes(2)
    expect(mockMergeUserAttachment).toHaveBeenCalledWith(
      userId,
      "attachment-123",
      expect.objectContaining({
        pl: expect.any(Number),
        v: expect.any(Number),
        certainty: expect.any(Number),
        inferenceMethod: expect.any(String),
        sourceInteractionId: interactionId,
      }),
    )
  })

  it("should handle empty attachment list", async () => {
    const userId = "user123"
    const result = await updateSelfMapWithInferences(userId, [])

    // Should return 0 for empty list
    expect(result).toBe(0)
  })

  it("should handle errors during attachment processing", async () => {
    // Mock KgService methods - first succeeds, second fails
    const mockFindOrCreateAttachmentNode = vi
      .fn()
      .mockResolvedValueOnce("attachment-123")
      .mockRejectedValueOnce(new Error("Database error"))

    const mockMergeUserAttachment = vi.fn().mockResolvedValue(true)

    // Mock the KgService constructor
    vi.mocked(KgService).mockImplementation(() => {
      return {
        findOrCreateAttachmentNode: mockFindOrCreateAttachmentNode,
        mergeUserAttachment: mockMergeUserAttachment,
      } as unknown as KgService
    })

    const userId = "user123"

    // Call the function
    const result = await updateSelfMapWithInferences(userId, sampleAttachments)

    // Verify the result - only one attachment should be processed successfully
    expect(result).toBe(1)
  })
})
