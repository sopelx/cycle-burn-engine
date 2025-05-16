import { NextResponse } from "next/server"
import { redis } from "@/lib/redis"

export async function GET() {
  try {
    // Test Redis connection
    await redis.set("test_key", "Redis connection successful!")
    const value = await redis.get("test_key")

    return NextResponse.json({
      success: true,
      message: "Redis connection test successful",
      value,
    })
  } catch (error) {
    console.error("Redis connection test failed:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Redis connection test failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
