"use client"

import { useState, useEffect, useCallback } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"

// Constants
const CYCLE_TOKEN_ADDRESS = "HJ2n2a3YK1LTBCRbS932cTtmXw4puhgG8Jb2WcpEpump"
const MINIMUM_CYCLE_BALANCE = 100_000

export function useCycleToken() {
  const { connection } = useConnection()
  const { publicKey, connected } = useWallet()

  const [cycleBalance, setCycleBalance] = useState<number | null>(null)
  const [hasSufficientCycle, setHasSufficientCycle] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkCycleBalance = useCallback(async () => {
    if (!publicKey || !connection) {
      setCycleBalance(null)
      setHasSufficientCycle(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create PublicKey objects
      const tokenPublicKey = new PublicKey(CYCLE_TOKEN_ADDRESS)

      // Get token accounts
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, { mint: tokenPublicKey })

      // Process token accounts
      let cycleAmount = 0

      if (tokenAccounts.value.length > 0) {
        for (const { account } of tokenAccounts.value) {
          const parsedInfo = account.data.parsed.info
          const tokenAmount = parsedInfo.tokenAmount

          if (parsedInfo.mint === CYCLE_TOKEN_ADDRESS) {
            cycleAmount = Number(tokenAmount.uiAmount)
            break
          }
        }
      }

      console.log(`CYCLE Balance: ${cycleAmount}`)
      setCycleBalance(cycleAmount)
      setHasSufficientCycle(cycleAmount >= MINIMUM_CYCLE_BALANCE)

      if (cycleAmount < MINIMUM_CYCLE_BALANCE) {
        setError(`Need ${MINIMUM_CYCLE_BALANCE.toLocaleString()} CYCLE to vote`)
      }
    } catch (err: any) {
      console.error("Error checking CYCLE balance:", err)

      if (err.message && (err.message.includes("403") || err.message.includes("429"))) {
        setError("RPC connection issue")
      } else {
        setError("Failed to check balance")
      }

      setCycleBalance(null)
      setHasSufficientCycle(false)
    } finally {
      setIsLoading(false)
    }
  }, [publicKey, connection])

  // Check balance when wallet connects or changes
  useEffect(() => {
    if (connected && publicKey) {
      checkCycleBalance()
    } else {
      setCycleBalance(null)
      setHasSufficientCycle(false)
      setError(null)
    }
  }, [connected, publicKey, checkCycleBalance])

  return {
    cycleBalance,
    hasSufficientCycle,
    isLoading,
    error,
    checkCycleBalance,
    minimumRequired: MINIMUM_CYCLE_BALANCE,
  }
}
