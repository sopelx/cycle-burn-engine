"use client"

import { useState, useEffect } from "react"
import { Clock, Users, AlertCircle, Flame, Sparkles, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useWallet } from "@solana/wallet-adapter-react"
import { useCycleToken } from "@/lib/use-cycle-token"
import type { VoteData } from "@/lib/redis"

export default function VotingPanel() {
  const { publicKey, connected } = useWallet()
  const { hasSufficientCycle, error } = useCycleToken()
  const { toast } = useToast()

  const [voteData, setVoteData] = useState<VoteData | null>(null)
  const [timeLeft, setTimeLeft] = useState<string>("00:00:00")
  const [hasVoted, setHasVoted] = useState(false)
  const [voteSubmitting, setVoteSubmitting] = useState(false)
  const [voteError, setVoteError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch vote data
  const fetchVoteData = async () => {
    try {
      const response = await fetch("/api/vote")
      const data = await response.json()

      if (data.success) {
        setVoteData(data.data)
      } else {
        console.error("Error fetching vote data:", data.message)
      }
    } catch (error) {
      console.error("Error fetching vote data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Check if user has already voted
  const checkVoteStatus = async () => {
    if (!publicKey) return

    try {
      const response = await fetch(`/api/vote/check?wallet=${publicKey.toString()}`)
      const data = await response.json()

      if (data.success) {
        setHasVoted(data.hasVoted)
      }
    } catch (error) {
      console.error("Error checking vote status:", error)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchVoteData()

    // Refresh vote data every 30 seconds
    const interval = setInterval(fetchVoteData, 30000)

    return () => clearInterval(interval)
  }, [])

  // Check vote status when wallet connects
  useEffect(() => {
    if (publicKey) {
      checkVoteStatus()
    } else {
      setHasVoted(false)
    }
  }, [publicKey])

  // Update countdown timer
  useEffect(() => {
    if (!voteData) return

    const updateTimer = () => {
      const now = Date.now()
      const endTime = voteData.endTime

      if (now >= endTime) {
        setTimeLeft("00:00:00")
        return
      }

      const diff = endTime - now
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      )
    }

    updateTimer()
    const timer = setInterval(updateTimer, 1000)

    return () => clearInterval(timer)
  }, [voteData])

  const handleVote = async (optionId: string) => {
    if (!connected || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to vote",
        variant: "destructive",
      })
      return
    }

    if (!hasSufficientCycle && !error?.includes("RPC")) {
      toast({
        title: "Insufficient CYCLE",
        description: "You need at least 100,000 CYCLE tokens to vote",
        variant: "destructive",
      })
      return
    }

    if (hasVoted) {
      toast({
        title: "Already voted",
        description: "This wallet has already voted in this round",
        variant: "destructive",
      })
      return
    }

    setVoteSubmitting(true)
    setVoteError(null)

    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          optionId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Update local state
        setHasVoted(true)

        // Refresh vote data
        await fetchVoteData()

        // Find the option label
        const option = voteData?.options.find((opt) => opt.id === optionId)
        const optionLabel = option ? option.label : optionId

        toast({
          title: "Vote submitted",
          description: `You voted: ${optionLabel}`,
          variant: "default",
        })
      } else {
        setVoteError(data.message || "Failed to submit vote")

        toast({
          title: "Error",
          description: data.message || "Failed to submit your vote",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error submitting vote:", error)
      setVoteError("Failed to submit vote")

      toast({
        title: "Error",
        description: "Failed to submit your vote. Please try again.",
        variant: "destructive",
      })
    } finally {
      setVoteSubmitting(false)
    }
  }

  // Get button style based on option type (yes/no/other)
  const getButtonStyle = (optionId: string, label: string) => {
    // Use neutral colors for all buttons
    return "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 shadow-lg shadow-black/20 relative overflow-hidden"
  }

  // Get progress bar style based on option type
  const getProgressStyle = (optionId: string, label: string) => {
    // Use neutral colors for all progress bars
    return "bg-gray-700"
  }

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 relative z-10">
        <Card className="glass-dark max-w-3xl mx-auto backdrop-blur-sm border-gray-800/50 shadow-2xl overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center py-16 px-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              <div
                className="absolute inset-0 animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"
                style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
              ></div>
            </div>
            <span className="mt-4 text-gray-400 font-medium">Loading vote data...</span>
          </CardContent>
        </Card>
      </section>
    )
  }

  if (!voteData) {
    return (
      <section className="container mx-auto px-4 relative z-10">
        <Card className="glass-dark max-w-3xl mx-auto backdrop-blur-sm border-gray-800/50 shadow-2xl overflow-hidden">
          <CardContent className="py-12">
            <Alert className="bg-red-900/30 border-red-800 text-red-300">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Failed to load vote data. Please refresh the page.</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section className="container mx-auto px-4 relative z-10">
      <Card className="glass-dark max-w-3xl mx-auto backdrop-blur-sm border-gray-800/50 shadow-2xl overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-pink-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-30"></div>
        </div>

        <CardHeader className="pb-2 relative z-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
            <Flame className="h-5 w-5 text-purple-500 animate-pulse-slow" />
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
          </div>

          <h3 className="text-xl md:text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-white relative">
            {voteData.question}
            <span className="absolute -top-1 -right-1 text-yellow-500">
              <Sparkles className="h-4 w-4 animate-pulse-slow" />
            </span>
          </h3>

          <div className="flex items-center justify-center gap-2 text-gray-400 mt-6 glass py-2 px-4 rounded-full w-fit mx-auto border border-gray-800/50 shadow-inner">
            <Clock className="h-4 w-4 text-purple-500" />
            <span className="text-sm">
              Voting ends in: <span className="text-white font-mono font-medium">{timeLeft}</span>
            </span>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 p-6">
          {!connected && (
            <Alert className="mb-6 glass border-blue-800/50 text-blue-300 shadow-lg">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Connect your wallet to vote</AlertDescription>
            </Alert>
          )}

          {connected && !hasSufficientCycle && !error?.includes("RPC") && (
            <Alert className="mb-6 glass border-yellow-800/50 text-yellow-300 shadow-lg">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Need 100,000 CYCLE to vote</AlertDescription>
            </Alert>
          )}

          {connected && error?.includes("RPC") && (
            <Alert className="mb-6 glass border-orange-800/50 text-orange-300 shadow-lg">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Connection issue. Try again later.</AlertDescription>
            </Alert>
          )}

          {hasVoted && (
            <Alert className="mb-6 glass border-green-800/50 text-green-300 shadow-lg">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>Your vote has been recorded</AlertDescription>
            </Alert>
          )}

          <div className={`grid gap-4 mb-8 mt-4 ${voteData?.options?.length > 2 ? "grid-cols-1" : "grid-cols-2"}`}>
            {voteData?.options?.map((option) => (
              <Button
                key={option.id}
                className={`${getButtonStyle(option.id, option.label)} h-14 text-lg font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]`}
                onClick={() => handleVote(option.id)}
                disabled={
                  !connected ||
                  (!hasSufficientCycle && !error?.includes("RPC")) ||
                  hasVoted ||
                  voteSubmitting ||
                  !voteData.isActive ||
                  Date.now() > voteData.endTime
                }
              >
                <span className="relative z-10">
                  {voteSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    option.label
                  )}
                </span>
                <div className="absolute inset-0 animate-shimmer"></div>
              </Button>
            ))}
          </div>

          {voteError && (
            <Alert className="mb-6 glass border-red-800/50 text-red-300 shadow-lg">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{voteError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6 mb-8 glass p-6 rounded-xl border border-gray-800/50 shadow-inner">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-400 flex items-center">
                <BarChart3 className="h-4 w-4 mr-2 text-purple-500" />
                Current Results
              </h4>
              <div className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded-full">
                {voteData.totalVotes} votes
              </div>
            </div>

            {voteData?.options?.map((option) => {
              const percentage = voteData.totalVotes > 0 ? (option.votes / voteData.totalVotes) * 100 : 0

              return (
                <div key={option.id} className="space-y-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{option.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">{option.votes} votes</span>
                      <span className="font-bold bg-gray-800 px-2 py-0.5 rounded-full text-xs">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-gray-800/80 rounded-full overflow-hidden shadow-inner relative">
                    <div
                      className={`h-full ${getProgressStyle(option.id, option.label)} rounded-full transition-all duration-500 ease-out relative`}
                      style={{ width: `${percentage}%` }}
                    >
                      {percentage > 5 && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-center gap-2 text-gray-400 glass py-3 px-4 rounded-lg border border-gray-800/50">
            <Users className="h-4 w-4 text-purple-500" />
            <span className="text-sm">{voteData.totalVotes} wallets have voted</span>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

// Import CheckCircle2 icon
import { CheckCircle2 } from "lucide-react"
