import { KgInteractionLayer } from "../kg-interaction-layer"
import { createDriver, closeDriver } from "../neo4j-driver"
import type { Driver } from "neo4j-driver"
import { describe, beforeAll, afterAll, afterEach, it, expect } from "@jest/globals"

describe("KgInteractionLayer", () => {
  let driver: Driver
  let kgLayer: KgInteractionLayer

  beforeAll(async () => {
    driver = await createDriver()
    kgLayer = new KgInteractionLayer(driver)
  })

  afterAll(async () => {
    await closeDriver(driver)
  })

  // Clean up test data after each test
  afterEach(async () => {
    await kgLayer.executeCypher("MATCH (n:TestNode) DETACH DELETE n")
  })

  describe("mergeNodeWithProperties", () => {
    it("should create a new node when it doesn't exist", async () => {
      // Arrange
      const label = "TestNode"
      const identityProps = { id: "test-1" }
      const updateProps = { name: "Test Node", count: 1 }

      // Act
      const result = await kgLayer.mergeNodeWithProperties(label, identityProps, updateProps)

      // Assert
      expect(result).not.toBeNull()
      const properties = result?.get("n").properties
      expect(properties.id).toBe("test-1")
      expect(properties.name).toBe("Test Node")
      expect(properties.count).toBe(1)
    })

    it("should update an existing node without overwriting unrelated properties", async () => {
      // Arrange - Create initial node
      await kgLayer.executeCypher("CREATE (n:TestNode {id: $id, name: $name, count: $count, extraProp: $extraProp})", {
        id: "test-2",
        name: "Initial Name",
        count: 1,
        extraProp: "Should Not Change",
      })

      // Act - Update only some properties
      const result = await kgLayer.mergeNodeWithProperties(
        "TestNode",
        { id: "test-2" },
        { name: "Updated Name", count: 2 },
      )

      // Assert
      expect(result).not.toBeNull()
      const properties = result?.get("n").properties
      expect(properties.id).toBe("test-2")
      expect(properties.name).toBe("Updated Name")
      expect(properties.count).toBe(2)
      expect(properties.extraProp).toBe("Should Not Change") // This property should remain unchanged
    })

    it("should handle null and undefined values correctly", async () => {
      // Arrange
      const label = "TestNode"
      const identityProps = { id: "test-3" }
      const updateProps = { name: null, count: undefined, validProp: "Valid" }

      // Act
      const result = await kgLayer.mergeNodeWithProperties(label, identityProps, updateProps)

      // Assert
      expect(result).not.toBeNull()
      const properties = result?.get("n").properties
      expect(properties.id).toBe("test-3")
      expect(properties.name).toBeNull()
      expect(properties.validProp).toBe("Valid")
      // undefined values should not be set
      expect(properties.count).toBeUndefined()
    })
  })
})
