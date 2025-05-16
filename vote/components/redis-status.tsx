"use client"

import { useState, useEffect } from "react"
import { Database } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function RedisStatus() {
  const [status, setStatus] = useState<"loading" | "connected" | "error">("loading")
  const [message, setMessage] = useState("Checking Redis connection...")

  useEffect(() => {
    const checkRedisConnection = async () => {
      try {
        const response = await fetch("/api/redis-test")
        const data = await response.json()

        if (data.success) {
          setStatus("connected")
          setMessage("Redis connected successfully")
        } else {
          setStatus("error")
          setMessage(`Redis connection error: ${data.message}`)
        }
      } catch (error) {
        setStatus("error")
        setMessage(`Redis connection error: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }

    checkRedisConnection()
  }, [])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            <Database
              className={`h-4 w-4 mr-1 ${
                status === "loading" ? "text-yellow-500" : status === "connected" ? "text-green-500" : "text-red-500"
              }`}
            />
            <span className="text-xs text-gray-400">
              {status === "loading" ? "Connecting..." : status === "connected" ? "Redis" : "Redis Error"}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
