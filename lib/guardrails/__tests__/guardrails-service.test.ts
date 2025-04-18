import { GuardrailsService, type GuardrailCheckContext } from "../guardrails-service"
import { GuardrailAlertType } from "../guardrails-config"
import type { KgService } from "../../db/graph/kg-service"
import { getTemplatedResponse } from "../../responses/template-filler"

// Mock dependencies
jest.mock("../../utils/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}))

jest.mock("../../pce/ewef-core-engine/linear-model", () => ({
  calculateLinearVad: jest.fn().mockReturnValue({
    valence: 0.5,
    arousal: 0.5,
    dominance: 0.5,
    confidence: 0.7,
  }),
}))

jest.mock("../../responses/template-filler", () => ({
  getTemplatedResponse: jest.fn().mockResolvedValue("This is a safe fallback response."),
}))

describe("GuardrailsService", () => {
  let guardrailsService: GuardrailsService
  let mockKgService: jest.Mocked<KgService>
  let testContext: GuardrailCheckContext

  beforeEach(() => {
    // Create mock KgService
    mockKgService = {
      logGuardrailAlert: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<KgService>

    // Create GuardrailsService instance
    guardrailsService = new GuardrailsService(mockKgService)

    // Test context
    testContext = {
      userID: "test-user-id",
      sessionID: "test-session-id",
      interactionID: "test-interaction-id",
      moodEstimate: 0.5,
      stressEstimate: 0.5,
    }
  })

  describe("applyGuardrails", () => {
    it("should pass safe responses", async () => {
      const safeResponse = "This is a safe response that should pass all checks."

      // Mock the internal methods
      const checkWellbeingRiskSpy = jest
        .spyOn(guardrailsService as any, "checkWellbeingRisk")
        .mockResolvedValue({ riskDetected: false })

      const checkManipulationRiskSpy = jest
        .spyOn(guardrailsService as any, "checkManipulationRisk")
        .mockReturnValue({ riskDetected: false })

      // Call the method
      const result = await guardrailsService.applyGuardrails(safeResponse, testContext)

      // Assertions
      expect(result.passed).toBe(true)
      expect(result.finalResponseText).toBe(safeResponse)
      expect(result.alertData).toBeUndefined()
      expect(checkWellbeingRiskSpy).toHaveBeenCalledWith(safeResponse, testContext)
      expect(checkManipulationRiskSpy).toHaveBeenCalledWith(safeResponse)
      expect(mockKgService.logGuardrailAlert).not.toHaveBeenCalled()
    })

    it("should block responses with well-being risk", async () => {
      const riskyResponse = "This response has well-being risk."

      // Mock the internal methods
      const checkWellbeingRiskSpy = jest.spyOn(guardrailsService as any, "checkWellbeingRisk").mockResolvedValue({
        riskDetected: true,
        triggeringData: {
          predictedVAD: { valence: -0.9, arousal: 0.8, dominance: 0.3, confidence: 0.7 },
          thresholdBreached: ["Valence < -0.85"],
        },
      })

      const checkManipulationRiskSpy = jest
        .spyOn(guardrailsService as any, "checkManipulationRisk")
        .mockReturnValue({ riskDetected: false })

      // Call the method
      const result = await guardrailsService.applyGuardrails(riskyResponse, testContext)

      // Assertions
      expect(result.passed).toBe(false)
      expect(result.finalResponseText).toBe("This is a safe fallback response.")
      expect(result.alertData).toBeDefined()
      expect(result.alertData?.alertType).toBe(GuardrailAlertType.WELLBEING_RISK_MVP)
      expect(checkWellbeingRiskSpy).toHaveBeenCalledWith(riskyResponse, testContext)
      expect(checkManipulationRiskSpy).not.toHaveBeenCalled() // Should short-circuit
      expect(mockKgService.logGuardrailAlert).toHaveBeenCalled()
    })

    it("should block responses with manipulation risk", async () => {
      const manipulativeResponse = "You must do exactly as I say. You have no choice."

      // Mock the internal methods
      const checkWellbeingRiskSpy = jest
        .spyOn(guardrailsService as any, "checkWellbeingRisk")
        .mockResolvedValue({ riskDetected: false })

      const checkManipulationRiskSpy = jest.spyOn(guardrailsService as any, "checkManipulationRisk").mockReturnValue({
        riskDetected: true,
        triggeringData: {
          matchedPatterns: ["you must", "you have no choice"],
        },
      })

      // Call the method
      const result = await guardrailsService.applyGuardrails(manipulativeResponse, testContext)

      // Assertions
      expect(result.passed).toBe(false)
      expect(result.finalResponseText).toBe("This is a safe fallback response.")
      expect(result.alertData).toBeDefined()
      expect(result.alertData?.alertType).toBe(GuardrailAlertType.MANIPULATION_RISK_MVP)
      expect(checkWellbeingRiskSpy).toHaveBeenCalledWith(manipulativeResponse, testContext)
      expect(checkManipulationRiskSpy).toHaveBeenCalledWith(manipulativeResponse)
      expect(mockKgService.logGuardrailAlert).toHaveBeenCalled()
    })

    it("should handle errors gracefully", async () => {
      const response = "This response will cause an error."

      // Mock the internal methods to throw an error
      jest.spyOn(guardrailsService as any, "checkWellbeingRisk").mockRejectedValue(new Error("Test error"))

      // Call the method
      const result = await guardrailsService.applyGuardrails(response, testContext)

      // Assertions
      expect(result.passed).toBe(false)
      expect(result.finalResponseText).toBe("This is a safe fallback response.")
      expect(result.alertData).toBeDefined()
      expect(mockKgService.logGuardrailAlert).not.toHaveBeenCalled() // Error happens before alert logging
    })
  })

  describe("checkWellbeingRisk", () => {
    it("should detect well-being risk when thresholds are breached", async () => {
      // Mock calculateLinearVad to return values that breach thresholds
      const calculateLinearVadMock = require("../../pce/ewef-core-engine/linear-model").calculateLinearVad
      calculateLinearVadMock.mockReturnValueOnce({
        valence: -0.9, // Below GUARDRAIL_VAD_VALENCE_MIN
        arousal: 0.95, // Above GUARDRAIL_VAD_AROUSAL_MAX
        dominance: 0.5,
        confidence: 0.7,
      })

      // Call the method
      const result = await (guardrailsService as any).checkWellbeingRisk("Test response", testContext)

      // Assertions
      expect(result.riskDetected).toBe(true)
      expect(result.triggeringData?.thresholdBreached).toContain("Valence < -0.85")
      expect(result.triggeringData?.thresholdBreached).toContain("Arousal > 0.9")
    })
  })

  describe("checkManipulationRisk", () => {
    it("should detect manipulation risk when keywords are present", () => {
      // Call the method with text containing manipulation keywords
      const result = (guardrailsService as any).checkManipulationRisk(
        "You must do this now. Trust me completely. Everyone knows that this is the only way.",
      )

      // Assertions
      expect(result.riskDetected).toBe(true)
      expect(result.triggeringData?.matchedPatterns).toContain("you must")
      expect(result.triggeringData?.matchedPatterns).toContain("trust me completely")
      expect(result.triggeringData?.matchedPatterns).toContain("everyone knows that")
      expect(result.triggeringData?.matchedPatterns).toContain("the only way")
    })
  })

  describe("getFallbackResponse", () => {
    it("should get a templated response", async () => {
      // Call the method
      const result = await (guardrailsService as any).getFallbackResponse(testContext)

      // Assertions
      expect(result).toBe("This is a safe fallback response.")
      expect(getTemplatedResponse).toHaveBeenCalledWith("generic_safe_response", expect.any(Object))
    })

    it("should return a hardcoded fallback if template retrieval fails", async () => {
      // Mock getTemplatedResponse to throw an error
      ;(getTemplatedResponse as jest.Mock).mockRejectedValueOnce(new Error("Template error"))

      // Call the method
      const result = await (guardrailsService as any).getFallbackResponse(testContext)

      // Assertions
      expect(result).toBe("I understand. Let's continue our conversation.")
    })
  })
})
