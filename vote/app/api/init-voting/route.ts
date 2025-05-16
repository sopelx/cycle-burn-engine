import { NextResponse } from "next/server"
import { redis, type VoteData, type VoteHistoryItem } from "@/lib/redis"

// Default vote data
const DEFAULT_VOTE_DATA: VoteData = {
  question: "Should we trigger the next community burn now?",
  endTime: Date.now() + 3 * 60 * 60 * 1000, // 3 hours from now
  options: [
    { id: "yes", label: "YES - Burn Now", color: "green", votes: 72 },
    { id: "no", label: "NO - Wait", color: "red", votes: 28 },
  ],
  totalVotes: 100,
  isActive: true,
}

// Sample vote history
const SAMPLE_HISTORY: VoteHistoryItem[] = [
  {
    id: "vote-1",
    date: "2024-05-18 19:02",
    question: "Should we trigger the next community burn?",
    winningOption: "YES - Burn Now",
    result: "YES",
    burnAmount: "189,240 $CYCLE",
    txId: "0x7a2d...f3e9",
    totalVotes: 164,
    options: [
      { label: "YES - Burn Now", votes: 118, percentage: 72.0 },
      { label: "NO - Wait", votes: 46, percentage: 28.0 },
    ],
  },
  {
    id: "vote-2",
    date: "2024-05-17 23:50",
    question: "Should we delay the burn until next week?",
    winningOption: "NO - Burn on schedule",
    result: "NO",
    burnAmount: "—",
    txId: "—",
    totalVotes: 142,
    options: [
      { label: "YES - Delay burn", votes: 52, percentage: 36.6 },
      { label: "NO - Burn on schedule", votes: 90, percentage: 63.4 },
    ],
  },
  {
    id: "vote-3",
    date: "2024-05-16 14:25",
    question: "Should we increase the burn amount?",
    winningOption: "YES - Increase burn",
    result: "YES",
    burnAmount: "156,780 $CYCLE",
    txId: "0x9c4e...a1b2",
    totalVotes: 178,
    options: [
      { label: "YES - Increase burn", votes: 103, percentage: 57.9 },
      { label: "NO - Keep current amount", votes: 75, percentage: 42.1 },
    ],
  },
]

export async function GET() {
  try {
    // Check if vote data already exists
    const existingVoteData = await redis.get("current_vote")

    if (!existingVoteData) {
      // Initialize with default vote data
      await redis.set("current_vote", DEFAULT_VOTE_DATA)
    }

    // Check if vote history already exists
    const existingHistory = await redis.get("vote_history")

    if (!existingHistory) {
      // Initialize with sample history
      await redis.set("vote_history", SAMPLE_HISTORY)
    }

    return NextResponse.json({
      success: true,
      message: "Voting system initialized successfully",
      voteData: existingVoteData || DEFAULT_VOTE_DATA,
      history: existingHistory || SAMPLE_HISTORY,
    })
  } catch (error) {
    console.error("Failed to initialize voting system:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to initialize voting system",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
