"use client"

import { useState } from "react"
import { Wallet, LogOut, Copy, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSolanaWallet } from "@/lib/solana-wallet-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

export default function SolanaWalletButton() {
  const {
    publicKey,
    isConnecting,
    isConnected,
    hasSufficientCycle,
    cycleBalance,
    error,
    connectWallet,
    disconnectWallet,
    checkCycleBalance,
  } = useSolanaWallet()

  const [copied, setCopied] = useState(false)

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  const copyToClipboard = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const openExplorer = () => {
    if (publicKey) {
      const explorerUrl = `https://solscan.io/account/${publicKey}`
      window.open(explorerUrl, "_blank")
    }
  }

  const refreshBalance = async () => {
    await checkCycleBalance()
  }

  if (!isConnected) {
    return (
      <Button
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
        onClick={connectWallet}
        disabled={isConnecting}
      >
        <Wallet className="mr-2 h-4 w-4" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="border-purple-700 text-purple-400 hover:bg-purple-950/30 hover:text-purple-300"
            >
              <Wallet className="mr-2 h-4 w-4" />
              {publicKey ? formatAddress(publicKey) : "Connected"}
              {hasSufficientCycle && <Badge className="ml-2 bg-green-600 text-white text-xs">Verified</Badge>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 bg-gray-900 border-gray-800">
            <div className="px-2 py-1.5 text-sm font-medium text-gray-400">Solana Wallet</div>
            <DropdownMenuSeparator className="bg-gray-800" />

            <div className="px-2 py-1.5 text-xs text-gray-500">
              CYCLE Balance: {cycleBalance !== null ? cycleBalance.toLocaleString() : "Loading..."}
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 ml-1 text-gray-400 hover:text-gray-300"
                onClick={refreshBalance}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                  <path d="M21 3v5h-5"></path>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                  <path d="M8 16H3v5"></path>
                </svg>
              </Button>
            </div>

            {hasSufficientCycle ? (
              <div className="px-2 py-1.5 text-xs text-green-500 flex items-center">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Eligible to vote
              </div>
            ) : (
              <div className="px-2 py-1.5 text-xs text-red-500 flex items-center">
                <AlertCircle className="mr-1 h-3 w-3" />
                Need {MINIMUM_CYCLE_BALANCE.toLocaleString()} CYCLE to vote
              </div>
            )}

            <DropdownMenuSeparator className="bg-gray-800" />

            <DropdownMenuItem
              className="flex cursor-pointer items-center py-2 text-purple-400 hover:text-purple-300 focus:bg-purple-950/30 focus:text-purple-300"
              onClick={copyToClipboard}
            >
              {copied ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "Copied!" : "Copy Address"}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex cursor-pointer items-center py-2 text-purple-400 hover:text-purple-300 focus:bg-purple-950/30 focus:text-purple-300"
              onClick={openExplorer}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View on Solscan
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-800" />
            <DropdownMenuItem
              className="flex cursor-pointer items-center py-2 text-red-400 hover:text-red-300 focus:bg-red-950/30 focus:text-red-300"
              onClick={disconnectWallet}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {error && <div className="text-red-500 text-sm mt-2 text-center">{error}</div>}
      </div>
    </TooltipProvider>
  )
}

// Constant for minimum CYCLE balance
const MINIMUM_CYCLE_BALANCE = 100_000
