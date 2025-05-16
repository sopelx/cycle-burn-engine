import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { WalletProviders } from "@/lib/wallet-providers"
import VotingInitializer from "@/components/voting-initializer"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "CycleSol Community Burn Voting",
  description: "Decide when the fire starts. This loop listens to the crowd.",
  authors: [{ name: "sopel", url: "https://github.com/sopelx" }],
  repository: "https://github.com/sopelx/cycle-burn-engine/vote",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <WalletProviders>
            <VotingInitializer />
            {children}
          </WalletProviders>
        </ThemeProvider>
      </body>
    </html>
  )
}
