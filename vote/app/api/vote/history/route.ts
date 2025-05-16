import { NextResponse } from "next/server"
import { getVoteHistory } from "@/lib/redis"

export async function GET() {
  try {
    const history = await getVoteHistory()

    return NextResponse.json({
      success: true,
      data: history,
    })
  } catch (error) {
    console.error("Error getting vote history:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
