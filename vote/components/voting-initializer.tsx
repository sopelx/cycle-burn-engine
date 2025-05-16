"use client"

import { useEffect, useState } from "react"

export default function VotingInitializer() {
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeVoting = async () => {
      try {
        // First test Redis connection
        const testResponse = await fetch("/api/redis-test")
        const testData = await testResponse.json()

        if (!testData.success) {
          throw new Error(testData.message || "Redis connection failed")
        }

        // Then initialize voting system
        const initResponse = await fetch("/api/init-voting")
        const initData = await initResponse.json()

        if (!initData.success) {
          throw new Error(initData.message || "Failed to initialize voting system")
        }

        setInitialized(true)
        console.log("Voting system initialized successfully")
      } catch (error) {
        console.error("Initialization error:", error)
        setError(error instanceof Error ? error.message : "Unknown error occurred")
      }
    }

    initializeVoting()
  }, [])

  // This component doesn't render anything visible
  return null
}
