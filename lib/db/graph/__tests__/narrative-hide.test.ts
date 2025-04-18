import { KgService } from "../kg-service"
import type { KgInteractionLayer } from "../kg-interaction-layer"
import { logger } from "@/lib/utils/logger"

// Mock dependencies
jest.mock("../kg-interaction-layer")
jest.mock("@/lib/utils/logger", () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}))

describe("KgService.hideErInstance", () => {
  // Setup mocks
  const mockExecuteCypherScalar = jest.fn()
  const mockKgInteractionLayer = {
    executeCypherScalar: mockExecuteCypherScalar,
  } as unknown as KgInteractionLayer

  let kgService: KgService

  beforeEach(() => {
    jest.clearAllMocks()
    kgService = new KgService({} as any)
    // @ts-ignore - Set the mocked kgLayer
    kgService.kgLayer = mockKgInteractionLayer
  })

  it("should return false if userId is missing", async () => {
    // Act
    const result = await kgService.hideErInstance("", "test-interaction-id")

    // Assert
    expect(result).toBe(false)
    expect(logger.warn).toHaveBeenCalled()
    expect(mockExecuteCypherScalar).not.toHaveBeenCalled()
  })

  it("should return false if interactionId is missing", async () => {
    // Act
    const result = await kgService.hideErInstance("test-user-id", "")

    // Assert
    expect(result).toBe(false)
    expect(logger.warn).toHaveBeenCalled()
    expect(mockExecuteCypherScalar).not.toHaveBeenCalled()
  })

  it("should return false if no ERInstance nodes were updated", async () => {
    // Arrange
    mockExecuteCypherScalar.mockResolvedValue(0)

    // Act
    const result = await kgService.hideErInstance("test-user-id", "test-interaction-id")

    // Assert
    expect(result).toBe(false)
    expect(mockExecuteCypherScalar).toHaveBeenCalled()
  })

  it("should return true if at least one ERInstance node was updated", async () => {
    // Arrange
    mockExecuteCypherScalar.mockResolvedValue(1)

    // Act
    const result = await kgService.hideErInstance("test-user-id", "test-interaction-id")

    // Assert
    expect(result).toBe(true)
    expect(mockExecuteCypherScalar).toHaveBeenCalled()
    expect(mockExecuteCypherScalar).toHaveBeenCalledWith(expect.stringContaining("SET e.isHiddenByUser = true"), {
      userId: "test-user-id",
      interactionId: "test-interaction-id",
    })
  })

  it("should return false if an error occurs", async () => {
    // Arrange
    mockExecuteCypherScalar.mockRejectedValue(new Error("Test error"))

    // Act
    const result = await kgService.hideErInstance("test-user-id", "test-interaction-id")

    // Assert
    expect(result).toBe(false)
    expect(logger.error).toHaveBeenCalled()
  })
})
