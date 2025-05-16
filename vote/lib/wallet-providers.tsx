"use client"

import type React from "react"

import { useMemo } from "react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css"

// Constants
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com"

export function WalletProviders({ children }: { children: React.ReactNode }) {
  // Set to 'mainnet-beta' for production or 'devnet' for development
  const network = WalletAdapterNetwork.MainnetBeta

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => SOLANA_RPC_URL, [])

  // Initialize only the most reliable wallet adapters
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], [network])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
