import { type NextRequest, NextResponse } from "next/server"
import { recordVote, hasWalletVoted, getVoteData } from "@/lib/redis"

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, optionId } = await request.json()

    if (!walletAddress || !optionId) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Check if voting is active
    const voteData = await getVoteData()
    if (!voteData.isActive || Date.now() > voteData.endTime) {
      return NextResponse.json({ success: false, message: "Voting has ended" }, { status: 400 })
    }

    // Check if option exists
    const optionExists = voteData.options.some((opt) => opt.id === optionId)
    if (!optionExists) {
      return NextResponse.json({ success: false, message: "Invalid option" }, { status: 400 })
    }

    // Check if wallet has already voted
    const hasVoted = await hasWalletVoted(walletAddress)
    if (hasVoted) {
      return NextResponse.json({ success: false, message: "This wallet has already voted" }, { status: 400 })
    }

    // Record the vote
    const success = await recordVote(walletAddress, optionId)

    if (success) {
      return NextResponse.json({ success: true, message: "Vote recorded successfully" })
    } else {
      return NextResponse.json({ success: false, message: "Failed to record vote" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error processing vote:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const voteData = await getVoteData()

    return NextResponse.json({
      success: true,
      data: voteData,
    })
  } catch (error) {
    console.error("Error getting vote data:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
