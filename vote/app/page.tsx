import { Flame, ExternalLink, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import VotingPanel from "@/components/voting-panel"
import MultiWalletButton from "@/components/multi-wallet-button"

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-purple-600/10 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute top-[40%] right-[5%] w-80 h-80 bg-pink-600/10 rounded-full blur-3xl"
          style={{ animationDelay: "2s", animationDuration: "7s" }}
        ></div>
        <div
          className="absolute bottom-[10%] left-[15%] w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl"
          style={{ animationDelay: "1s", animationDuration: "8s" }}
        ></div>

        {/* Grid lines */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZGVmcz4KICA8cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KICAgIDxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMTI4LCAxMjgsIDEyOCwgMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPgogIDwvcGF0dGVybj4KPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiIC8+Cjwvc3ZnPg==')] opacity-30"></div>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-16 pb-12 md:pt-24 md:pb-16 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-6 px-4 py-2 rounded-full bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 animate-pulse-slow">
            <Flame className="h-5 w-5 text-purple-500" />
            <h2 className="text-sm font-medium uppercase tracking-wider text-purple-400">Community Burn Voting</h2>
            <Flame className="h-5 w-5 text-pink-500" />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 relative">
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent animate-gradient">
              Decide when the fire starts.
            </span>
            <Sparkles className="absolute -top-6 -right-6 h-8 w-8 text-yellow-500 animate-pulse-slow" />
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-xl mx-auto">
            This loop listens to the crowd. Your vote shapes the future of CycleSol.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <MultiWalletButton />
            <Button
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800/50 hover:text-white backdrop-blur-sm transition-all duration-300 hover:scale-105"
            >
              View Active Vote
            </Button>
          </div>
        </div>
      </section>

      {/* Voting Panel */}
      <VotingPanel />

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-800/50 mt-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-500 text-sm">© 2025 CycleSol. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <a
              href="https://cyclesol.dev"
              className="text-gray-400 hover:text-white text-sm flex items-center transition-all duration-300 hover:scale-105"
              target="_blank"
              rel="noopener noreferrer"
            >
              CycleSol.dev
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
