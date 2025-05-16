"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { Connection, PublicKey } from "@solana/web3.js"

// Constants
const CYCLE_TOKEN_ADDRESS = "HJ2n2a3YK1LTBCRbS932cTtmXw4puhgG8Jb2WcpEpump"
const MINIMUM_CYCLE_BALANCE = 100_000
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com"

type SolanaWalletContextType = {
  publicKey: string | null
  isConnecting: boolean
  isConnected: boolean
  hasSufficientCycle: boolean
  cycleBalance: number | null
  error: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  checkCycleBalance: () => Promise<void>
}

const SolanaWalletContext = createContext<SolanaWalletContextType>({
  publicKey: null,
  isConnecting: false,
  isConnected: false,
  hasSufficientCycle: false,
  cycleBalance: null,
  error: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  checkCycleBalance: async () => {},
})

export const useSolanaWallet = () => useContext(SolanaWalletContext)

export const SolanaWalletProvider = ({ children }: { children: ReactNode }) => {
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [hasSufficientCycle, setHasSufficientCycle] = useState(false)
  const [cycleBalance, setCycleBalance] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [connection, setConnection] = useState<Connection | null>(null)

  // Initialize Solana connection
  useEffect(() => {
    const conn = new Connection(SOLANA_RPC_URL)
    setConnection(conn)
  }, [])

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.solana) {
        try {
          // Check if the wallet is already connected
          if (window.solana.isConnected) {
            const walletPublicKey = window.solana.publicKey.toString()
            setPublicKey(walletPublicKey)
            setIsConnected(true)

            // Check token balance
            await checkCycleBalanceInternal(walletPublicKey)
          }
        } catch (err) {
          console.error("Failed to check existing connection:", err)
        }
      }
    }

    checkConnection()
  }, [])

  // Setup event listeners for wallet events
  useEffect(() => {
    if (typeof window !== "undefined" && window.solana) {
      const handleDisconnect = () => {
        console.log("Wallet disconnected")
        disconnectWallet()
      }

      window.solana.on("disconnect", handleDisconnect)

      return () => {
        window.solana.removeListener("disconnect", handleDisconnect)
      }
    }
  }, [])

  // Function to check CYCLE token balance
  const checkCycleBalanceInternal = async (walletAddress: string) => {
    if (!connection) return

    try {
      setError(null)

      // Create PublicKey objects
      const walletPublicKey = new PublicKey(walletAddress)
      const tokenPublicKey = new PublicKey(CYCLE_TOKEN_ADDRESS)

      // With Helius, we can use getParsedTokenAccountsByOwner which gives cleaner data
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPublicKey, { mint: tokenPublicKey })

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
        // Shorter error message
        setError(`Need ${MINIMUM_CYCLE_BALANCE.toLocaleString()} CYCLE to vote`)
      }
    } catch (err: any) {
      console.error("Error checking CYCLE balance:", err)

      // More user-friendly error message
      if (err.message && (err.message.includes("403") || err.message.includes("429"))) {
        setError("RPC connection issue")
      } else {
        setError("Failed to check balance")
      }

      setCycleBalance(null)
      setHasSufficientCycle(false)
    }
  }

  const checkCycleBalance = async () => {
    if (!publicKey) return
    await checkCycleBalanceInternal(publicKey)
  }

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.solana) {
      setError("No Solana wallet found")
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      // Request connection to the wallet
      await window.solana.connect()

      const walletPublicKey = window.solana.publicKey.toString()
      setPublicKey(walletPublicKey)
      setIsConnected(true)

      // Check token balance after connecting
      await checkCycleBalanceInternal(walletPublicKey)
    } catch (err: any) {
      console.error("Error connecting wallet:", err)

      if (err.message && err.message.includes("403")) {
        // If we get a 403 error, still connect the wallet but use fallback verification
        setPublicKey(window.solana.publicKey.toString())
        setIsConnected(true)
        setError("Connection issue")
      } else {
        setError(err.message || "Failed to connect")
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    if (window.solana && window.solana.isConnected) {
      window.solana.disconnect()
    }

    setPublicKey(null)
    setIsConnected(false)
    setCycleBalance(null)
    setHasSufficientCycle(false)
  }

  return (
    <SolanaWalletContext.Provider
      value={{
        publicKey,
        isConnecting,
        isConnected,
        hasSufficientCycle,
        cycleBalance,
        error,
        connectWallet,
        disconnectWallet,
        checkCycleBalance,
      }}
    >
      {children}
    </SolanaWalletContext.Provider>
  )
}

// Add type definition for window.solana
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean
      isConnected: boolean
      publicKey: { toString: () => string }
      connect: () => Promise<void>
      disconnect: () => Promise<void>
      on: (event: string, callback: any) => void
      removeListener: (event: string, callback: any) => void
    }
  }
}
