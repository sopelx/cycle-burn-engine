import { Redis } from "@upstash/redis"

// Initialize Redis client
export const redis = new Redis({
  url: process.env.KV_REST_API_URL || "",
  token: process.env.KV_REST_API_TOKEN || "",
})

// Vote option type
export type VoteOption = {
  id: string
  label: string
  color: string
  votes: number
}

// Vote data type with support for multiple options
export type VoteData = {
  question: string
  endTime: number // Unix timestamp in milliseconds
  options: VoteOption[]
  totalVotes: number
  isActive: boolean
}

// Default vote data
const DEFAULT_VOTE_DATA: VoteData = {
  question: "Should we trigger the next community burn now?",
  endTime: Date.now() + 3 * 60 * 60 * 1000, // 3 hours from now
  options: [
    { id: "yes", label: "YES - Burn Now", color: "green", votes: 0 },
    { id: "no", label: "NO - Wait", color: "red", votes: 0 },
  ],
  totalVotes: 0,
  isActive: true,
}

// Vote history item type
export type VoteHistoryItem = {
  id: string
  date: string
  question: string
  winningOption: string
  result: string
  burnAmount: string
  txId: string
  totalVotes: number
  options: Array<{
    label: string
    votes: number
    percentage: number
  }>
}

// Functions to interact with Redis

// Get current vote data
export async function getVoteData(): Promise<VoteData> {
  try {
    const data = await redis.get<VoteData>("current_vote")
    return data || DEFAULT_VOTE_DATA
  } catch (error) {
    console.error("Error getting vote data:", error)
    return DEFAULT_VOTE_DATA
  }
}

// Set vote data
export async function setVoteData(data: VoteData): Promise<void> {
  try {
    await redis.set("current_vote", data)
  } catch (error) {
    console.error("Error setting vote data:", error)
  }
}

// Record a vote
export async function recordVote(walletAddress: string, optionId: string): Promise<boolean> {
  try {
    // Check if wallet has already voted
    const hasVoted = await redis.sismember("voted_wallets", walletAddress)
    if (hasVoted) {
      return false
    }

    // Get current vote data
    const voteData = await getVoteData()

    // Find the option and update vote count
    const option = voteData.options.find((opt) => opt.id === optionId)
    if (!option) {
      return false
    }

    option.votes += 1
    voteData.totalVotes += 1

    // Save updated vote data
    await setVoteData(voteData)

    // Record wallet as having voted
    await redis.sadd("voted_wallets", walletAddress)

    return true
  } catch (error) {
    console.error("Error recording vote:", error)
    return false
  }
}

// Check if wallet has voted
export async function hasWalletVoted(walletAddress: string): Promise<boolean> {
  try {
    return await redis.sismember("voted_wallets", walletAddress)
  } catch (error) {
    console.error("Error checking if wallet voted:", error)
    return false
  }
}

// Get vote history
export async function getVoteHistory(): Promise<VoteHistoryItem[]> {
  try {
    const history = await redis.get<VoteHistoryItem[]>("vote_history")
    return history || []
  } catch (error) {
    console.error("Error getting vote history:", error)
    return []
  }
}

// Add item to vote history
export async function addToVoteHistory(item: VoteHistoryItem): Promise<void> {
  try {
    const history = await getVoteHistory()
    history.unshift(item) // Add to beginning of array
    await redis.set("vote_history", history)
  } catch (error) {
    console.error("Error adding to vote history:", error)
  }
}
