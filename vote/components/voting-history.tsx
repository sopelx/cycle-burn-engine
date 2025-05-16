"use client"

import { useState, useEffect } from "react"
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { VoteHistoryItem } from "@/lib/redis"

export default function VotingHistory() {
  const [historyData, setHistoryData] = useState<VoteHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/vote/history")
        const data = await response.json()

        if (data.success) {
          setHistoryData(data.data)
        } else {
          setError("Failed to load voting history")
        }
      } catch (error) {
        console.error("Error fetching vote history:", error)
        setError("Failed to load voting history")
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [])

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-center py-8 text-red-400">{error}. Please refresh the page.</div>
  }

  if (historyData.length === 0) {
    return <div className="text-center py-8 text-gray-400">No voting history available yet.</div>
  }

  return (
    <div className="space-y-4">
      {historyData.map((item) => (
        <Card key={item.id} className="bg-gray-900/50 border-gray-800 overflow-hidden shadow-md">
          <CardContent className="p-0">
            <div className="p-4 border-b border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge
                    className={`${
                      item.result === "YES" ? "bg-green-600" : item.result === "NO" ? "bg-red-600" : "bg-blue-600"
                    } text-white`}
                  >
                    {item.result}
                  </Badge>
                  <span className="text-sm text-gray-400">{item.date}</span>
                </div>
                <h3 className="text-md font-medium mt-1">{item.question}</h3>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-400">Burn Amount</div>
                  <div className="font-medium">{item.burnAmount}</div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                  onClick={() => toggleExpand(item.id)}
                >
                  {expandedItems[item.id] ? <ChevronUp /> : <ChevronDown />}
                </Button>
              </div>
            </div>

            {expandedItems[item.id] && (
              <div className="p-4 bg-gray-900/30">
                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-2">Voting Results ({item.totalVotes} total votes)</div>
                  <div className="space-y-3">
                    {item.options.map((option, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{option.label}</span>
                          <span>
                            {option.votes} votes ({option.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              option.label.toLowerCase().includes("yes")
                                ? "bg-gradient-to-r from-green-600 to-green-500"
                                : option.label.toLowerCase().includes("no")
                                  ? "bg-gradient-to-r from-red-600 to-red-500"
                                  : "bg-gradient-to-r from-blue-600 to-blue-500"
                            } rounded-full`}
                            style={{ width: `${option.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {item.txId !== "—" && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">Transaction ID</div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={`https://solscan.io/tx/${item.txId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300 flex items-center text-sm"
                          >
                            {item.txId}
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View transaction on Solscan</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
