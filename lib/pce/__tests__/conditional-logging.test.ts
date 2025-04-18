import {
  conditionallyLogDetailedAnalysis,
  shouldLogDetailedEwef,
  shouldFlagForTraining,
  shouldFlagForAggregation,
} from "../conditional-logging"
import { checkConsent } from "../../ethics/consent"
import { getEngagementMode } from "../../session/mode-manager"
import { logger } from "../../utils/logger"

// Mock dependencies
jest.mock("../../ethics/consent")
jest.mock("../../session/mode-manager")
jest.mock("../../utils/logger")

describe("Conditional Logging", () => {
  // Mock KgService
  const mockKgService = {
    createEWEFProcessingInstances: jest.fn().mockResolvedValue(undefined),
    setInteractionProperty: jest.fn().mockResolvedValue(true),
    getConsentProfile: jest.fn().mockResolvedValue({
      consentDetailedAnalysisLogging: true,
      consentAnonymizedPatternTraining: true,
    }),
  }

  // Mock data
  const mockParams = {
    userId: "user123",
    sessionId: "session456",
    interactionId: "interaction789",
    currentMode: "insight",
    kgService: mockKgService as any,
    stateData: {
      moodEstimate: 0.5,
      stressEstimate: 0.3,
    },
    perceptionData: {
      mhhSource: "internal",
      mhhPerspective: "self",
      mhhTimeframe: "present",
      mhhAcceptanceState: "accepted",
      pValuationShiftEstimate: 0.2,
      pPowerLevel: 0.7,
      pAppraisalConfidence: 0.8,
    },
    reactionData: {
      valence: 0.6,
      arousal: 0.4,
      dominance: 0.5,
      confidence: 0.9,
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(checkConsent as jest.Mock).mockReset()
    ;(getEngagementMode as jest.Mock).mockReset()
  })

  describe("conditionallyLogDetailedAnalysis", () => {
    it("should log detailed analysis when in insight mode with consent", async () => {
      // Setup mocks
      ;(checkConsent as jest.Mock).mockImplementation((userId, permission) => {
        if (permission === "consentDetailedAnalysisLogging") return Promise.resolve(true)
        if (permission === "consentAnonymizedPatternTraining") return Promise.resolve(true)
        return Promise.resolve(false)
      })

      // Call the function
      const result = await conditionallyLogDetailedAnalysis(mockParams)

      // Verify results
      expect(result).toBe(true)
      expect(checkConsent).toHaveBeenCalledWith(
        mockParams.userId,
        "consentDetailedAnalysisLogging",
        mockParams.kgService,
      )
      expect(checkConsent).toHaveBeenCalledWith(
        mockParams.userId,
        "consentAnonymizedPatternTraining",
        mockParams.kgService,
      )
      expect(mockKgService.createEWEFProcessingInstances).toHaveBeenCalledWith(
        mockParams.userId,
        mockParams.interactionId,
        mockParams.stateData,
        {
          mhhSource: mockParams.perceptionData.mhhSource,
          mhhPerspective: mockParams.perceptionData.mhhPerspective,
          mhhTimeframe: mockParams.perceptionData.mhhTimeframe,
          mhhAcceptanceState: mockParams.perceptionData.mhhAcceptanceState,
          pValuationShift: mockParams.perceptionData.pValuationShiftEstimate,
          pPowerLevel: mockParams.perceptionData.pPowerLevel,
          pAppraisalConfidence: mockParams.perceptionData.pAppraisalConfidence,
        },
        {
          vadV: mockParams.reactionData.valence,
          vadA: mockParams.reactionData.arousal,
          vadD: mockParams.reactionData.dominance,
          confidence: mockParams.reactionData.confidence,
        },
        true, // eligibleForTraining should be true
      )
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("Conditions met"), expect.any(Object))
    })

    it("should not log detailed analysis when in listening mode", async () => {
      // Setup mocks
      ;(checkConsent as jest.Mock).mockResolvedValue(true)
      const listeningParams = { ...mockParams, currentMode: "listening" }

      // Call the function
      const result = await conditionallyLogDetailedAnalysis(listeningParams)

      // Verify results
      expect(result).toBe(false)
      expect(checkConsent).toHaveBeenCalledWith(
        mockParams.userId,
        "consentDetailedAnalysisLogging",
        mockParams.kgService,
      )
      expect(mockKgService.createEWEFProcessingInstances).not.toHaveBeenCalled()
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("Conditions NOT met"), expect.any(Object))
    })

    it("should not log detailed analysis when no consent", async () => {
      // Setup mocks
      ;(checkConsent as jest.Mock).mockResolvedValue(false)

      // Call the function
      const result = await conditionallyLogDetailedAnalysis(mockParams)

      // Verify results
      expect(result).toBe(false)
      expect(checkConsent).toHaveBeenCalledWith(
        mockParams.userId,
        "consentDetailedAnalysisLogging",
        mockParams.kgService,
      )
      expect(mockKgService.createEWEFProcessingInstances).not.toHaveBeenCalled()
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("Conditions NOT met"), expect.any(Object))
    })

    it("should handle errors during KG update", async () => {
      // Setup mocks
      ;(checkConsent as jest.Mock).mockResolvedValue(true)
      mockKgService.createEWEFProcessingInstances.mockRejectedValueOnce(new Error("DB error"))

      // Call the function
      const result = await conditionallyLogDetailedAnalysis(mockParams)

      // Verify results
      expect(result).toBe(false)
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("Error during KG update"), expect.any(Object))
    })
  })

  describe("shouldLogDetailedEwef", () => {
    it("should return true when in insight mode with consent", async () => {
      // Setup mocks
      ;(getEngagementMode as jest.Mock).mockResolvedValue("insight")
      ;(checkConsent as jest.Mock).mockResolvedValue(true)

      // Call the function
      const result = await shouldLogDetailedEwef("user123", "session456", mockKgService as any)

      // Verify results
      expect(result).toBe(true)
      expect(getEngagementMode).toHaveBeenCalledWith("user123", "session456")
      expect(checkConsent).toHaveBeenCalledWith("user123", "consentDetailedAnalysisLogging", mockKgService)
    })

    it("should return false when in listening mode", async () => {
      // Setup mocks
      ;(getEngagementMode as jest.Mock).mockResolvedValue("listening")
      ;(checkConsent as jest.Mock).mockResolvedValue(true)

      // Call the function
      const result = await shouldLogDetailedEwef("user123", "session456", mockKgService as any)

      // Verify results
      expect(result).toBe(false)
    })

    it("should return false when no consent", async () => {
      // Setup mocks
      ;(getEngagementMode as jest.Mock).mockResolvedValue("insight")
      ;(checkConsent as jest.Mock).mockResolvedValue(false)

      // Call the function
      const result = await shouldLogDetailedEwef("user123", "session456", mockKgService as any)

      // Verify results
      expect(result).toBe(false)
    })

    it("should handle errors", async () => {
      // Setup mocks
      ;(getEngagementMode as jest.Mock).mockRejectedValueOnce(new Error("Redis error"))

      // Call the function
      const result = await shouldLogDetailedEwef("user123", "session456", mockKgService as any)

      // Verify results
      expect(result).toBe(false)
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error checking if detailed EWEF should be logged"),
        expect.any(Object),
      )
    })
  })

  describe("shouldFlagForTraining", () => {
    it("should return true when consent is granted", async () => {
      // Setup mocks
      ;(checkConsent as jest.Mock).mockResolvedValue(true)

      // Call the function
      const result = await shouldFlagForTraining("user123", "session456", mockKgService as any)

      // Verify results
      expect(result).toBe(true)
      expect(checkConsent).toHaveBeenCalledWith("user123", "consentAnonymizedPatternTraining", mockKgService)
    })

    it("should return false when consent is not granted", async () => {
      // Setup mocks
      ;(checkConsent as jest.Mock).mockResolvedValue(false)

      // Call the function
      const result = await shouldFlagForTraining("user123", "session456", mockKgService as any)

      // Verify results
      expect(result).toBe(false)
    })

    it("should handle errors", async () => {
      // Setup mocks
      ;(checkConsent as jest.Mock).mockRejectedValueOnce(new Error("DB error"))

      // Call the function
      const result = await shouldFlagForTraining("user123", "session456", mockKgService as any)

      // Verify results
      expect(result).toBe(false)
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error checking if data should be flagged for training"),
        expect.any(Object),
      )
    })
  })

  describe("shouldFlagForAggregation", () => {
    it("should return true when consent is granted", async () => {
      // Setup mocks
      ;(checkConsent as jest.Mock).mockResolvedValue(true)

      // Call the function
      const result = await shouldFlagForAggregation("user123", "session456", mockKgService as any)

      // Verify results
      expect(result).toBe(true)
      expect(checkConsent).toHaveBeenCalledWith("user123", "consentAggregation", mockKgService)
    })

    it("should return false when consent is not granted", async () => {
      // Setup mocks
      ;(checkConsent as jest.Mock).mockResolvedValue(false)

      // Call the function
      const result = await shouldFlagForAggregation("user123", "session456", mockKgService as any)

      // Verify results
      expect(result).toBe(false)
    })

    it("should handle errors", async () => {
      // Setup mocks
      ;(checkConsent as jest.Mock).mockRejectedValueOnce(new Error("DB error"))

      // Call the function
      const result = await shouldFlagForAggregation("user123", "session456", mockKgService as any)

      // Verify results
      expect(result).toBe(false)
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error checking if data should be flagged for aggregation"),
        expect.any(Object),
      )
    })
  })
})
