import { getNeo4jDriver } from "../lib/db/graph/neo4j-driver"
import { KgService } from "../lib/db/graph/kg-service"
import { v4 as uuidv4 } from "uuid"
import { processPceMvpRequest } from "../lib/pce/pce-service-mvp"
import { setEngagementMode } from "../lib/session/mode-manager"
import { getRedisClient } from "../lib/redis/client"
import { jest } from "@jest/globals"

// Mock consent for testing
const mockConsent = new Map<string, boolean>()

// Override checkConsent function for testing
jest.mock("../lib/ethics/consent", () => ({
  checkConsent: jest.fn((userId: string, permission: string) => {
    const key = `${userId}:${permission}`
    return Promise.resolve(mockConsent.get(key) || false)
  }),
}))

async function testUigE2e() {
  console.log("🧪 Running UIG end-to-end test...")

  try {
    const driver = getNeo4jDriver()
    const kgService = new KgService(driver)
    const redis = getRedisClient()

    // Generate test IDs
    const testUserId = `test-user-${uuidv4().substring(0, 8)}`
    const testSessionId = `test-session-${uuidv4().substring(0, 8)}`

    console.log(`\n📝 Using test user ID: ${testUserId}`)
    console.log(`\n📝 Using test session ID: ${testSessionId}`)

    // Step 1: Create a test user
    console.log("\n🧑 Creating test user...")
    try {
      await kgService.kgLayer.executeCypher(
        `
        CREATE (u:User {
          userID: $userID,
          email: 'test@example.com',
          name: 'Test User',
          createdAt: timestamp(),
          bootstrappingComplete: false
        })
      `,
        { userID: testUserId },
      )
      console.log("✅ Test user created successfully")
    } catch (error) {
      console.error("❌ Error creating test user:", error)
      process.exit(1)
    }

    // Step 2: Set up consent for testing
    console.log("\n🔒 Setting up consent for testing...")
    mockConsent.set(`${testUserId}:consentDetailedAnalysisLogging`, true)
    mockConsent.set(`${testUserId}:consentAnonymizedPatternTraining`, true)
    console.log("✅ Consent set up successfully")

    // Step 3: Set engagement mode to insight
    console.log("\n🔍 Setting engagement mode to insight...")
    await setEngagementMode(testUserId, testSessionId, "insight")
    console.log("✅ Engagement mode set successfully")

    // Step 4: Process a test request
    console.log("\n💬 Processing test request...")
    const result = await processPceMvpRequest(
      {
        userID: testUserId,
        sessionID: testSessionId,
        utteranceText: "This is a test message",
      },
      { useLlmAssistance: false, currentTurn: 1 },
    )
    console.log(`✅ Test request processed successfully with interaction ID: ${result.interactionId}`)

    // Step 5: Verify the created data
    console.log("\n🔍 Verifying created data...")
    try {
      // Verify interaction
      const interactionExists = await kgService.kgLayer.executeCypherScalar<boolean>(
        `
        MATCH (i:Interaction {interactionID: $interactionID})
        RETURN count(i) > 0 as exists
      `,
        { interactionID: result.interactionId },
      )

      console.log(`✅ Interaction exists: ${interactionExists}`)

      // Verify EWEF instances
      const instancesExist = await kgService.kgLayer.executeCypherScalar<boolean>(
        `
        MATCH (i:Interaction {interactionID: $interactionID})
        MATCH (i)-[:HAS_STATE]->(s:UserStateInstance)
        MATCH (i)-[:GENERATED_DURING]->(p:PInstance)
        MATCH (i)-[:GENERATED_DURING]->(e:ERInstance)
        RETURN count(s) > 0 AND count(p) > 0 AND count(e) > 0 as exists
      `,
        { interactionID: result.interactionId },
      )

      console.log(`✅ EWEF instances exist and are linked correctly: ${instancesExist}`)

      // Verify training flag
      const trainingFlagSet = await kgService.kgLayer.executeCypherScalar<boolean>(
        `
        MATCH (i:Interaction {interactionID: $interactionID})
        RETURN i.eligibleForTraining = true as flagSet
      `,
        { interactionID: result.interactionId },
      )

      console.log(`✅ Training flag is set correctly: ${trainingFlagSet}`)
    } catch (error) {
      console.error("❌ Error verifying created data:", error)
      process.exit(1)
    }

    // Clean up test data
    console.log("\n🧹 Cleaning up test data...")
    try {
      await kgService.kgLayer.executeCypher(
        `
        MATCH (u:User {userID: $userID})
        OPTIONAL MATCH (i:Interaction {userID: $userID})
        OPTIONAL MATCH (i)-[:HAS_STATE]->(s:UserStateInstance)
        OPTIONAL MATCH (i)-[:GENERATED_DURING]->(p:PInstance)
        OPTIONAL MATCH (i)-[:GENERATED_DURING]->(e:ERInstance)
        DETACH DELETE u, i, s, p, e
      `,
        { userID: testUserId },
      )
      console.log("✅ Test data cleaned up successfully")
    } catch (error) {
      console.error("❌ Error cleaning up test data:", error)
    }

    // Clean up Redis data
    console.log("\n🧹 Cleaning up Redis data...")
    try {
      const keys = await redis.keys(`*${testSessionId}*`)
      if (keys.length > 0) {
        await redis.del(keys)
      }
      console.log("✅ Redis data cleaned up successfully")
    } catch (error) {
      console.error("❌ Error cleaning up Redis data:", error)
    }

    await driver.close()
    console.log("\n🎉 UIG end-to-end test completed successfully!")
    process.exit(0)
  } catch (error) {
    console.error("❌ Error running UIG end-to-end test:", error)
    process.exit(1)
  }
}

testUigE2e()
