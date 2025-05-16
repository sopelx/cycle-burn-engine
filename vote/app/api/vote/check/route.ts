import { type NextRequest, NextResponse } from "next/server"
import { hasWalletVoted } from "@/lib/redis"

export async function GET(request: NextRequest) {
  try {
    const walletAddress = request.nextUrl.searchParams.get("wallet")

    if (!walletAddress) {
      return NextResponse.json({ success: false, message: "Missing wallet address" }, { status: 400 })
    }

    const hasVoted = await hasWalletVoted(walletAddress)

    return NextResponse.json({
      success: true,
      hasVoted,
    })
  } catch (error) {
    console.error("Error checking vote status:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
