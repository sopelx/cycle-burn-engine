"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Wallet, LogOut, Copy, ExternalLink, CheckCircle2, AlertCircle, RefreshCw, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useCycleToken } from "@/lib/use-cycle-token"

export default function MultiWalletButton() {
  const { publicKey, disconnect } = useWallet()
  const { cycleBalance, hasSufficientCycle, isLoading, error, checkCycleBalance, minimumRequired } = useCycleToken()

  const [copied, setCopied] = useState(false)

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  const copyToClipboard = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const openExplorer = () => {
    if (publicKey) {
      const explorerUrl = `https://solscan.io/account/${publicKey.toString()}`
      window.open(explorerUrl, "_blank")
    }
  }

  const refreshBalance = async () => {
    await checkCycleBalance()
  }

  // If not connected, show the multi-wallet button
  if (!publicKey) {
    return (
      <div className="custom-wallet-button-container">
        <WalletMultiButton className="custom-wallet-button" />
        <style jsx global>{`
          .custom-wallet-button-container .wallet-adapter-button {
            background: #1f2937;
            color: white;
            border: 1px solid rgba(75, 85, 99, 0.4);
            border-radius: 0.5rem;
            height: 2.75rem;
            padding: 0 1.25rem;
            font-size: 0.875rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -4px rgba(0, 0, 0, 0.2);
            position: relative;
            overflow: hidden;
            z-index: 1;
          }
          
          .custom-wallet-button-container .wallet-adapter-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            transition: all 0.5s;
            z-index: -1;
          }
          
          .custom-wallet-button-container .wallet-adapter-button:hover {
            background: #2d3748;
            transform: translateY(-2px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
          }
          
          .custom-wallet-button-container .wallet-adapter-button:hover::before {
            left: 100%;
          }
          
          .custom-wallet-button-container .wallet-adapter-button:active {
            transform: translateY(1px);
          }
          
          .custom-wallet-button-container .wallet-adapter-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          
          .custom-wallet-button-container .wallet-adapter-button-start-icon {
            margin-right: 0.5rem;
          }
          
          .wallet-adapter-modal-wrapper {
            background-color: rgba(17, 24, 39, 0.95);
            border: 1px solid rgba(75, 85, 99, 0.3);
            border-radius: 1rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(12px);
          }
          
          .wallet-adapter-modal-button-close {
            background-color: rgba(55, 65, 81, 0.5);
            border-radius: 0.5rem;
            transition: all 0.2s;
          }
          
          .wallet-adapter-modal-button-close:hover {
            background-color: rgba(75, 85, 99, 0.7);
          }
          
          .wallet-adapter-modal-title {
            color: white;
            font-weight: 600;
          }
          
          .wallet-adapter-modal-list {
            margin: 1rem 0;
          }
          
          .wallet-adapter-modal-list-more {
            color: #d1d5db;
            transition: all 0.2s;
          }
          
          .wallet-adapter-modal-list-more:hover {
            color: #f3f4f6;
          }
          
          .wallet-adapter-modal-list li {
            background-color: rgba(55, 65, 81, 0.5);
            border-radius: 0.75rem;
            margin-bottom: 0.75rem;
            transition: all 0.3s;
            border: 1px solid rgba(75, 85, 99, 0.2);
            overflow: hidden;
          }
          
          .wallet-adapter-modal-list li:hover {
            background-color: rgba(75, 85, 99, 0.7);
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
          }
          
          .wallet-adapter-modal-middle button {
            background: #374151;
            color: white;
            transition: all 0.3s;
            border-radius: 0.5rem;
            font-weight: 500;
          }
          
          .wallet-adapter-modal-middle button:hover {
            background: #4b5563;
            transform: translateY(-1px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
          }
        `}</style>
      </div>
    )
  }

  // If connected, show our custom dropdown
  return (
    <div className="flex flex-col">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="glass border-gray-700/50 text-gray-300 hover:bg-gray-800/50 hover:text-white shadow-lg shadow-black/10 h-11 px-4 transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gray-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Wallet className="mr-2 h-4 w-4 relative" />
            <span className="relative">{publicKey ? formatAddress(publicKey.toString()) : "Connected"}</span>
            {hasSufficientCycle && (
              <Badge className="ml-2 bg-gray-700 text-white text-xs relative overflow-hidden">
                <span className="relative z-10 flex items-center">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="glass-dark w-64 border-gray-800/50 shadow-xl backdrop-blur-md rounded-xl overflow-hidden">
          <div className="px-3 py-2 text-sm font-medium text-gray-300 border-b border-gray-800/50">Solana Wallet</div>

          <div className="p-3 bg-gray-800/30 border-b border-gray-800/50">
            <div className="text-xs text-gray-400 mb-1">CYCLE Balance</div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-white">
                {isLoading ? "Loading..." : cycleBalance !== null ? cycleBalance.toLocaleString() : "Unknown"}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-gray-400 hover:text-gray-300 hover:bg-gray-800/50"
                onClick={refreshBalance}
                disabled={isLoading}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {hasSufficientCycle ? (
            <div className="px-3 py-2 text-xs text-green-400 flex items-center bg-green-900/10">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Eligible to vote
            </div>
          ) : (
            <div className="px-3 py-2 text-xs text-red-400 flex items-center bg-red-900/10">
              <AlertCircle className="mr-1 h-3 w-3" />
              Need {minimumRequired.toLocaleString()} CYCLE to vote
            </div>
          )}

          <div className="p-1">
            <DropdownMenuItem
              className="flex cursor-pointer items-center py-2 px-3 text-gray-300 hover:text-white focus:bg-gray-700/50 focus:text-white rounded-lg transition-all duration-200"
              onClick={copyToClipboard}
            >
              {copied ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "Copied!" : "Copy Address"}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex cursor-pointer items-center py-2 px-3 text-gray-300 hover:text-white focus:bg-gray-700/50 focus:text-white rounded-lg transition-all duration-200"
              onClick={openExplorer}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View on Solscan
            </DropdownMenuItem>
          </div>

          <DropdownMenuSeparator className="bg-gray-800/50" />

          <div className="p-1">
            <DropdownMenuItem
              className="flex cursor-pointer items-center py-2 px-3 text-red-400 hover:text-red-300 focus:bg-red-900/20 focus:text-red-300 rounded-lg transition-all duration-200"
              onClick={disconnect}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Disconnect
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {error && (
        <div className="text-red-500 text-sm mt-2 text-center px-3 py-1 bg-red-900/20 rounded-lg backdrop-blur-sm">
          {error}
        </div>
      )}
    </div>
  )
}
