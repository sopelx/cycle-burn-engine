# 🔁 cycle-burn-engine

Autonomous revenue-based burn bot for [$CYCLE](https://cyclesol.dev), built on the Solana blockchain.  
This bot monitors SOL earnings from Pump.fun, swaps them into $CYCLE via Jupiter, and sends the tokens directly to a burn address — automatically, on loop.

---

## 🔥 What It Does

- Monitors dev wallet for revenue (0.05% from Pump.fun trades)
- Triggers swap when SOL threshold is reached (default: 2 SOL)
- Uses Jupiter Aggregator API for optimal SOL → $CYCLE swap
- Sends acquired $CYCLE to a predefined burn address
- Repeats endlessly, requiring no manual intervention

---

## ⚙️ Configuration

```env
RPC_URL=https://api.mainnet-beta.solana.com
WALLET_PRIVATE_KEY=[YOUR PRIVATE KEY]
THRESHOLD_SOL=2
CYCLE_MINT=YOUR_CYCLE_TOKEN_MINT
BURN_ADDRESS=CYCLEburn11111111111111111111111111111111


🤖 Sample Log Output

[+] Revenue Detected: 2.01 SOL
[✓] Swapped 2.01 SOL → 187,230.12 $CYCLE
[✓] Burned 187,230.12 $CYCLE to CYCLEburn1111...
[✓] Waiting for next loop...


📡 Live Protocol
You can monitor burn activity at:
https://cyclesol.dev