import { KgService } from "../kg-service"
import { KgInteractionLayer } from "../kg-interaction-layer"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { logger } from "../../utils/logger"

// Mock dependencies
vi.mock("../kg-interaction-layer")
vi.mock("../../utils/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

describe("KgService", () => {
  let kgService: KgService
  let mockDriver: any
  let mockKgLayer: any

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Create mock driver
    mockDriver = {}

    // Create mock KgInteractionLayer
    mockKgLayer = {
      executeCypher: vi.fn(),
      executeCypherScalar: vi.fn(),
      executeCypherSingle: vi.fn(),
      mergeNodeWithProperties: vi.fn(),
    }

    // Mock KgInteractionLayer constructor
    vi.mocked(KgInteractionLayer).mockImplementation(() => mockKgLayer)

    // Create KgService instance
    kgService = new KgService(mockDriver)
  })

  describe("createPInstance", () => {
    it("should create a PInstance node", async () => {
      // Arrange
      mockKgLayer.executeCypherScalar.mockResolvedValue("pinst-123")

      const pInstanceData = {
        mhhSource: "internal",
        mhhPerspective: "self",
        mhhTimeframe: "present",
        mhhAcceptanceState: "accepted",
        pValuationShiftEstimate: 0.5,
        pPowerLevel: 0.7,
        pAppraisalConfidence: 0.8,
      }

      // Act
      const result = await kgService.createPInstance("user-123", "interaction-123", pInstanceData)

      // Assert
      expect(mockKgLayer.executeCypherScalar).toHaveBeenCalledWith(
        expect.stringContaining("CREATE (p:PInstance"),
        expect.objectContaining({
          interactionId: "interaction-123",
          mhhSource: "internal",
          pValuationShiftEstimate: 0.5,
        }),
      )
      expect(result).toBe("pinst-123")
    })

    it("should handle errors and return null", async () => {
      // Arrange
      mockKgLayer.executeCypherScalar.mockRejectedValue(new Error("DB error"))

      // Act
      const result = await kgService.createPInstance("user-123", "interaction-123", {
        mhhSource: "internal",
        mhhPerspective: "self",
        mhhTimeframe: "present",
        mhhAcceptanceState: "accepted",
        pValuationShiftEstimate: 0.5,
        pPowerLevel: 0.7,
        pAppraisalConfidence: 0.8,
      })

      // Assert
      expect(result).toBeNull()
      expect(logger.error).toHaveBeenCalled()
    })
  })

  describe("createERInstance", () => {
    it("should create an ERInstance node", async () => {
      // Arrange
      mockKgLayer.executeCypherScalar.mockResolvedValue("erinst-123")

      const erData = {
        vad: { vadV: 0.5, vadA: 0.6, vadD: 0.7, confidence: 0.8 },
        emotionCategorization: { primaryLabel: "Happy", emotionGroup: "Positive", categoryDistribution: {} },
      }

      // Act
      const result = await kgService.createERInstance("user-123", "interaction-123", "pinst-123", erData)

      // Assert
      expect(mockKgLayer.executeCypherScalar).toHaveBeenCalledWith(
        expect.stringContaining("CREATE (e:ERInstance"),
        expect.objectContaining({
          userId: "user-123",
          pInstanceId: "pinst-123",
          vadV: 0.5,
          categoryDistribution: "{}",
        }),
      )
      expect(result).toBe("erinst-123")
    })

    it("should handle errors and return null", async () => {
      // Arrange
      mockKgLayer.executeCypherScalar.mockRejectedValue(new Error("DB error"))

      const erData = {
        vad: { vadV: 0.5, vadA: 0.6, vadD: 0.7, confidence: 0.8 },
        emotionCategorization: { primaryLabel: "Happy", emotionGroup: "Positive", categoryDistribution: {} },
      }

      // Act
      const result = await kgService.createERInstance("user-123", "interaction-123", "pinst-123", erData)

      // Assert
      expect(result).toBeNull()
      expect(logger.error).toHaveBeenCalled()
    })
  })
})
