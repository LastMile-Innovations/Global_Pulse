import { NextResponse } from "next/server"
import { executeSchemaSetup } from "../../../../lib/db/graph/schema-executor"
import { logger } from "../../../../lib/utils/logger"

export async function POST() {
  try {
    const success = await executeSchemaSetup()

    if (success) {
      return NextResponse.json({ success: true, message: "UIG schema setup completed successfully" })
    } else {
      return NextResponse.json(
        { success: false, message: "UIG schema setup failed. Check logs for details." },
        { status: 500 },
      )
    }
  } catch (error) {
    logger.error(`Error in schema setup API: ${error}`)
    return NextResponse.json({ success: false, message: `Error: ${error}` }, { status: 500 })
  }
}
