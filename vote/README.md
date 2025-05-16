# CycleSol Community Burn Voting Engine

A decentralized voting platform for the CycleSol community to decide on token burn events.

## Features

- Connect with Solana wallets (Phantom, Solflare)
- Verify CYCLE token holdings
- Participate in community burn votes
- View real-time voting results
- Historical voting data

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Solana Web3.js
- Solana Wallet Adapter
- Upstash Redis for data persistence

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn or npm
- A Solana RPC endpoint (Mainnet)

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

\`\`\`
NEXT_PUBLIC_SOLANA_RPC_URL=your_solana_rpc_endpoint
KV_REST_API_URL=your_upstash_redis_url
KV_REST_API_TOKEN=your_upstash_redis_token
\`\`\`

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/sopelx/cycle-burn-engine.git
cd cycle-burn-engine
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
# or
yarn
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This project is optimized for deployment on Vercel.

## License

MIT

## Author

sopel
\`\`\`

Let's update the .env.example file to remove any admin-related variables:

```plaintext file=".env.example"
# Solana RPC URL (required)
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Upstash Redis credentials (required for data persistence)
KV_REST_API_URL=
KV_REST_API_TOKEN=

# Optional read-only token for Redis
KV_REST_API_READ_ONLY_TOKEN=
