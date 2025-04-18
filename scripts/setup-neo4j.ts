import { executeSchemaSetup } from "../lib/db/graph/schema-executor"

// Execute the schema setup
executeSchemaSetup()
  .then((success) => {
    if (success) {
      console.log("✅ UIG schema setup completed successfully")
      process.exit(0)
    } else {
      console.error("❌ UIG schema setup failed")
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error(`❌ Unhandled error during schema setup: ${error}`)
    process.exit(1)
  })
