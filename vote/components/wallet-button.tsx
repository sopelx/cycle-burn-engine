"use client"

import { useState } from "react"
import { Wallet, LogOut, Copy, ExternalLink, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/lib/wallet-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function WalletButton() {
  const { address, chainId, isConnecting, isConnected, error, connectWallet, disconnectWallet } = useWallet()
  const [copied, setCopied] = useState(false)

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 1:
        return "Ethereum Mainnet"
      case 5:
        return "Goerli Testnet"
      case 11155111:
        return "Sepolia Testnet"
      case 137:
        return "Polygon Mainnet"
      case 80001:
        return "Mumbai Testnet"
      default:
        return `Chain ID: ${chainId}`
    }
  }

  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const openExplorer = () => {
    if (address) {
      let explorerUrl = ""

      // Determine explorer URL based on chainId
      switch (chainId) {
        case 1:
          explorerUrl = `https://etherscan.io/address/${address}`
          break
        case 5:
          explorerUrl = `https://goerli.etherscan.io/address/${address}`
          break
        case 11155111:
          explorerUrl = `https://sepolia.etherscan.io/address/${address}`
          break
        case 137:
          explorerUrl = `https://polygonscan.com/address/${address}`
          break
        case 80001:
          explorerUrl = `https://mumbai.polygonscan.com/address/${address}`
          break
        default:
          explorerUrl = `https://etherscan.io/address/${address}`
      }

      window.open(explorerUrl, "_blank")
    }
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="border-purple-700 text-purple-400 hover:bg-purple-950/30 hover:text-purple-300"
          >
            <Wallet className="mr-2 h-4 w-4" />
            {address ? formatAddress(address) : "Connected"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-gray-900 border-gray-800">
          <div className="px-2 py-1.5 text-sm font-medium text-gray-400">Wallet</div>
          <DropdownMenuSeparator className="bg-gray-800" />
          <div className="px-2 py-1.5 text-xs text-gray-500">{chainId && getNetworkName(chainId)}</div>
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
            View on Explorer
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

      {error && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="text-red-500 text-sm mt-2">{error}</div>
          </TooltipTrigger>
          <TooltipContent className="bg-red-950 border-red-800 text-white">
            <p>{error}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </TooltipProvider>
  )
}
