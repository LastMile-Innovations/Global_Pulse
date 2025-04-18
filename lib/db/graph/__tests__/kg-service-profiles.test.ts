import { KgService } from "../kg-service"
import { KgInteractionLayer } from "../kg-interaction-layer"
import { describe, beforeEach, test, expect, jest } from "@jest/globals"

// Mock KgInteractionLayer
jest.mock("../kg-interaction-layer")
jest.mock("uuid", () => ({
  v4: jest.fn().mockReturnValue("test-uuid"),
}))

describe("KgService - Core Profile Methods", () => {
  let kgService: KgService
  let mockKgLayer: jest.Mocked<KgInteractionLayer>

  beforeEach(() => {
    // Create mock KgInteractionLayer
    mockKgLayer = {
      executeCypher: jest.fn(),
      executeCypherSingle: jest.fn(),
      executeCypherScalar: jest.fn(),
      executeTransaction: jest.fn(),
      mergeNodeWithProperties: jest.fn(),
    } as unknown as jest.Mocked<KgInteractionLayer>

    // Mock KgInteractionLayer constructor
    ;(KgInteractionLayer as unknown as jest.Mock).mockImplementation(() => mockKgLayer)

    // Create KgService with mock driver
    kgService = new KgService({} as any)
  })

  describe("Cultural Context Profile", () => {
    test("should create a cultural context profile", async () => {
      mockKgLayer.mergeNodeWithProperties.mockResolvedValue({} as any)
      mockKgLayer.executeCypherScalar.mockResolvedValue("ccp-test-uuid")

      const result = await kgService.createCulturalContextProfile("test-user")

      expect(result).toBe("ccp-test-uuid")
      expect(mockKgLayer.mergeNodeWithProperties).toHaveBeenCalledWith(
        "CulturalContextProfile",
        { profileID: "ccp-test-uuid" },
        expect.objectContaining({
          profileID: "ccp-test-uuid",
          userID: "test-user",
          individualismScore: 0.5,
          powerDistanceScore: 0.5,
          uncertaintyAvoidanceScore: 0.5,
          primaryLanguage: "en",
        }),
      )
      expect(mockKgLayer.executeCypherScalar).toHaveBeenCalledWith(
        expect.stringContaining("MATCH (u:User {userID: $userId})"),
        { userId: "test-user", profileID: "ccp-test-uuid" },
      )
    })

    test("should get a cultural context profile", async () => {
      const mockProfile = {
        properties: {
          profileID: "ccp-test-uuid",
          userID: "test-user",
          individualismScore: 0.5,
          powerDistanceScore: 0.5,
        },
      }
      mockKgLayer.executeCypherSingle.mockResolvedValue({ get: jest.fn().mockReturnValue(mockProfile) } as any)

      const result = await kgService.getCulturalContextProfile("test-user")

      expect(result).toEqual(mockProfile.properties)
      expect(mockKgLayer.executeCypherSingle).toHaveBeenCalledWith(
        expect.stringContaining(
          "MATCH (u:User {userID: $userId})-[:HAS_PROFILE {type: 'Cultural'}]->(p:CulturalContextProfile)",
        ),
        { userId: "test-user" },
      )
    })

    test("should update a cultural context profile", async () => {
      mockKgLayer.executeCypherScalar.mockResolvedValue(1)

      const updates = {
        individualismScore: 0.7,
        powerDistanceScore: 0.3,
      }

      const result = await kgService.updateCulturalContextProfile("test-user", updates)

      expect(result).toBe(true)
      expect(mockKgLayer.executeCypherScalar).toHaveBeenCalledWith(
        expect.stringContaining(
          "MATCH (u:User {userID: $userId})-[:HAS_PROFILE {type: 'Cultural'}]->(p:CulturalContextProfile)",
        ),
        expect.objectContaining({
          userId: "test-user",
          individualismScore: 0.7,
          powerDistanceScore: 0.3,
        }),
      )
    })
  })

  describe("Personality Profile", () => {
    test("should create a personality profile", async () => {
      mockKgLayer.mergeNodeWithProperties.mockResolvedValue({} as any)
      mockKgLayer.executeCypherScalar.mockResolvedValue("pp-test-uuid")

      const result = await kgService.createPersonalityProfile("test-user")

      expect(result).toBe("pp-test-uuid")
      expect(mockKgLayer.mergeNodeWithProperties).toHaveBeenCalledWith(
        "PersonalityProfile",
        { profileID: "pp-test-uuid" },
        expect.objectContaining({
          profileID: "pp-test-uuid",
          userID: "test-user",
          OCEAN_O: 0.5,
          OCEAN_C: 0.5,
          OCEAN_E: 0.5,
          OCEAN_A: 0.5,
          OCEAN_N: 0.5,
        }),
      )
      expect(mockKgLayer.executeCypherScalar).toHaveBeenCalledWith(
        expect.stringContaining("MATCH (u:User {userID: $userId})"),
        { userId: "test-user", profileID: "pp-test-uuid" },
      )
    })

    test("should get a personality profile", async () => {
      const mockProfile = {
        properties: {
          profileID: "pp-test-uuid",
          userID: "test-user",
          OCEAN_O: 0.5,
          OCEAN_C: 0.5,
        },
      }
      mockKgLayer.executeCypherSingle.mockResolvedValue({ get: jest.fn().mockReturnValue(mockProfile) } as any)

      const result = await kgService.getPersonalityProfile("test-user")

      expect(result).toEqual(mockProfile.properties)
      expect(mockKgLayer.executeCypherSingle).toHaveBeenCalledWith(
        expect.stringContaining(
          "MATCH (u:User {userID: $userId})-[:HAS_PROFILE {type: 'Personality'}]->(p:PersonalityProfile)",
        ),
        { userId: "test-user" },
      )
    })

    test("should update a personality profile", async () => {
      mockKgLayer.executeCypherScalar.mockResolvedValue(1)

      const updates = {
        OCEAN_O: 0.7,
        OCEAN_N: 0.3,
      }

      const result = await kgService.updatePersonalityProfile("test-user", updates)

      expect(result).toBe(true)
      expect(mockKgLayer.executeCypherScalar).toHaveBeenCalledWith(
        expect.stringContaining(
          "MATCH (u:User {userID: $userId})-[:HAS_PROFILE {type: 'Personality'}]->(p:PersonalityProfile)",
        ),
        expect.objectContaining({
          userId: "test-user",
          OCEAN_O: 0.7,
          OCEAN_N: 0.3,
        }),
      )
    })
  })

  describe("Developmental Stage Profile", () => {
    test("should create a developmental stage profile", async () => {
      mockKgLayer.mergeNodeWithProperties.mockResolvedValue({} as any)
      mockKgLayer.executeCypherScalar.mockResolvedValue("dsp-test-uuid")

      const result = await kgService.createDevelopmentalStageProfile("test-user")

      expect(result).toBe("dsp-test-uuid")
      expect(mockKgLayer.mergeNodeWithProperties).toHaveBeenCalledWith(
        "DevelopmentalStageProfile",
        { profileID: "dsp-test-uuid" },
        expect.objectContaining({
          profileID: "dsp-test-uuid",
          userID: "test-user",
          eriksonStage: "Unknown",
          developmentalTaskTags: [],
          ageRange: "Unknown",
        }),
      )
      expect(mockKgLayer.executeCypherScalar).toHaveBeenCalledWith(
        expect.stringContaining("MATCH (u:User {userID: $userId})"),
        { userId: "test-user", profileID: "dsp-test-uuid" },
      )
    })

    test("should get a developmental stage profile", async () => {
      const mockProfile = {
        properties: {
          profileID: "dsp-test-uuid",
          userID: "test-user",
          eriksonStage: "Identity vs. Role Confusion",
          ageRange: "Adolescent",
        },
      }
      mockKgLayer.executeCypherSingle.mockResolvedValue({ get: jest.fn().mockReturnValue(mockProfile) } as any)

      const result = await kgService.getDevelopmentalStageProfile("test-user")

      expect(result).toEqual(mockProfile.properties)
      expect(mockKgLayer.executeCypherSingle).toHaveBeenCalledWith(
        expect.stringContaining(
          "MATCH (u:User {userID: $userId})-[:HAS_PROFILE {type: 'Developmental'}]->(p:DevelopmentalStageProfile)",
        ),
        { userId: "test-user" },
      )
    })

    test("should update a developmental stage profile", async () => {
      mockKgLayer.executeCypherScalar.mockResolvedValue(1)

      const updates = {
        eriksonStage: "Intimacy vs. Isolation",
        ageRange: "YoungAdult",
      }

      const result = await kgService.updateDevelopmentalStageProfile("test-user", updates)

      expect(result).toBe(true)
      expect(mockKgLayer.executeCypherScalar).toHaveBeenCalledWith(
        expect.stringContaining(
          "MATCH (u:User {userID: $userId})-[:HAS_PROFILE {type: 'Developmental'}]->(p:DevelopmentalStageProfile)",
        ),
        expect.objectContaining({
          userId: "test-user",
          eriksonStage: "Intimacy vs. Isolation",
          ageRange: "YoungAdult",
        }),
      )
    })
  })
})
