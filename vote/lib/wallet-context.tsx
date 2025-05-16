"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type BrowserProvider, type Eip1193Provider, ethers } from "ethers"

type WalletContextType = {
  address: string | null
  chainId: number | null
  isConnecting: boolean
  isConnected: boolean
  error: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  chainId: null,
  isConnecting: false,
  isConnected: false,
  error: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
})

export const useWallet = () => useContext(WalletContext)

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [provider, setProvider] = useState<BrowserProvider | null>(null)

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const ethersProvider = new ethers.BrowserProvider(window.ethereum as Eip1193Provider)
          const accounts = await ethersProvider.listAccounts()

          if (accounts.length > 0) {
            const network = await ethersProvider.getNetwork()
            setProvider(ethersProvider)
            setAddress(accounts[0].address)
            setChainId(Number(network.chainId))
            setIsConnected(true)
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
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          disconnectWallet()
        } else if (accounts[0] !== address) {
          // User switched accounts
          setAddress(accounts[0])
        }
      }

      const handleChainChanged = (chainIdHex: string) => {
        setChainId(Number.parseInt(chainIdHex, 16))
      }

      const handleDisconnect = (error: { code: number; message: string }) => {
        console.log("Wallet disconnected", error)
        disconnectWallet()
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)
      window.ethereum.on("disconnect", handleDisconnect)

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
        window.ethereum.removeListener("disconnect", handleDisconnect)
      }
    }
  }, [address])

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setError("No Ethereum wallet found. Please install MetaMask or another compatible wallet.")
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const ethersProvider = new ethers.BrowserProvider(window.ethereum as Eip1193Provider)
      const accounts = await ethersProvider.send("eth_requestAccounts", [])
      const network = await ethersProvider.getNetwork()

      setProvider(ethersProvider)
      setAddress(accounts[0])
      setChainId(Number(network.chainId))
      setIsConnected(true)
    } catch (err: any) {
      console.error("Error connecting wallet:", err)
      setError(err.message || "Failed to connect wallet")
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAddress(null)
    setChainId(null)
    setIsConnected(false)
    setProvider(null)
  }

  return (
    <WalletContext.Provider
      value={{
        address,
        chainId,
        isConnecting,
        isConnected,
        error,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

// Add type definition for window.ethereum
declare global {
  interface Window {
    ethereum?: Eip1193Provider & {
      on: (event: string, callback: any) => void
      removeListener: (event: string, callback: any) => void
      isMetaMask?: boolean
    }
  }
}
