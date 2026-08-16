<div align="center">

# 🌌 LuminaDex
### Concentrated Liquidity Market Maker (CLMM) DEX on Stellar Soroban
*Capital-efficient, tick-based liquidity provisioning for XLM ↔ USDC — built for Stellar's Soroban execution environment.*

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Stellar](https://img.shields.io/badge/Built%20on-Stellar-000000?logo=stellar)
![Soroban](https://img.shields.io/badge/Smart%20Contracts-Soroban-blueviolet)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB?logo=react)
![Status](https://img.shields.io/badge/Status-Level%203%20Complete-orange)

</div>

---
<img width="1919" height="923" alt="Screenshot 2026-08-16 184350" src="https://github.com/user-attachments/assets/dcf07969-bbca-48a6-bbb9-bd8f36eca472" />




## 🌟 What is LuminaDex?

LuminaDex is a **Concentrated Liquidity Market Maker (CLMM) decentralized exchange** built entirely on Stellar's Soroban smart contract platform. It is inspired by Uniswap v3's architecture and Raydium CLMM on Solana, adapted for Stellar's execution environment.

A CLMM DEX allows Liquidity Providers (LPs) to deposit liquidity into **discrete price ranges** rather than across the entire price curve from 0 to infinity. This makes every dollar of capital dramatically more efficient — LPs earn more fees, traders get less slippage — but requires active management of positions.

### 🔗 Project Resources & Links

| Resource | Link / Details |
| :--- | :--- |
| **Live Demo** | [https://lumina-dex-livid.vercel.app](https://lumina-dex-livid.vercel.app/) |
| 📜 **Contract Address (Testnet)** | `CCYBX2FOT5RWL6T2CQROAA3ZECYNNE3PSJ7WQXULU6AJOCCK6YHSTH32` |
| 🔍 **Proof of 59+ Wallet Interactions** | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CCYBX2FOT5RWL6T2CQROAA3ZECYNNE3PSJ7WQXULU6AJOCCK6YHSTH32) |
| 📈 **Pitch Deck (Presentation)** | [View on Google Drive](https://docs.google.com/presentation/d/1135sJMAdPgD99A1Jt0SJ0oHWpn-uwUY6/edit?usp=sharing&ouid=111617888193331830582&rtpof=true&sd=true) |
| 📊 **Live Demo Video** | [docs/pitch-outline.md](./docs/pitch-outline.md) |
| 📝 **User Feedback** | [View Spreadsheet](https://docs.google.com/spreadsheets/d/131JXBW54fSMdmeeXcjTRUYZhYKoJSFi1WKzNA8zrSOo/edit?usp=sharing) |



---


## 📋 Level 5 Submission Checklist

| Requirement | Status | Evidence |
|---|---|---|
| Minimum 20+ meaningful commits | ✅ (42+ commits) | `git log --oneline` |
| Live deployed application | ✅ |  [https://lumina-dex-livid.vercel.app](https://lumina-dex-livid.vercel.app/) |
| PPT/Pitch deck link | ✅ | [`docs/pitch-deck.html`](./docs/pitch-deck.html) — [View Pitch Deck Guide](./docs/pitch-deck.md) |
| Demo video link | ✅ | [`docs/demo-video.md`](./docs/demo-video.md) |
| Proof of 50+ users | ✅ (52 users) | [50+ verified users Excel Sheet Data](https://docs.google.com/spreadsheets/d/131JXBW54fSMdmeeXcjTRUYZhYKoJSFi1WKzNA8zrSOo/edit?usp=sharing) |
| Screenshots of analytics/transaction activity | ✅ | See [Screenshots](#-screenshots) & [Analytics Dashboard](#-analytics-dashboard) |
| Updated README and documentation | ✅ | This file |
| User feedback iteration summary | ✅ | See [Improvements Based on Feedback](#-improvements-based-on-user-feedback) |
| Google Form for user details | ✅ | [Feedback Form]([https://forms.gle/YOUR_FORM_ID_HERE](https://forms.gle/gEEYjqmHRHJ9u9Rm8)) |

---
## 🚀 Deployed Contracts (Stellar Testnet)

The `contracts/` directory was reorganized as a **Cargo workspace** with all contracts as members. Compilations and optimizations were performed, followed by fresh deployments using the `rishii` account on Stellar Testnet.

**Network:** Stellar Testnet · **Passphrase:** `Test SDF Network ; September 2015`

| Contract | Deployed Address (testnet) | Explorer |
|---|---|---|
| **Factory** | `CDFY5UX77PQDP2QGNY4YGZVKK6FE6J2LSSVZFXTQSHRO2JIES7LSZGPE` | [view](https://stellar.expert/explorer/testnet/contract/CDFY5UX77PQDP2QGNY4YGZVKK6FE6J2LSSVZFXTQSHRO2JIES7LSZGPE) |
| **Pool** (XLM/USDC 0.3%) | `CCYBX2FOT5RWL6T2CQROAA3ZECYNNE3PSJ7WQXULU6AJOCCK6YHSTH32` | [view](https://stellar.expert/explorer/testnet/contract/CCYBX2FOT5RWL6T2CQROAA3ZECYNNE3PSJ7WQXULU6AJOCCK6YHSTH32) |
| **Router** | `CDLCGPUP7NW4B4SSFG5H4I75PKDGPUZDHOX5C6YICJY7RDJ7VP7BAT62` | [view](https://stellar.expert/explorer/testnet/contract/CDLCGPUP7NW4B4SSFG5H4I75PKDGPUZDHOX5C6YICJY7RDJ7VP7BAT62) |
| **Position Manager** | `CC6IBQ7VNVK7CQYIZX47NJPDH5DL5ISQSA26BLBZXVMVEQ3QGUAZDREI` | [view](https://stellar.expert/explorer/testnet/contract/CC6IBQ7VNVK7CQYIZX47NJPDH5DL5ISQSA26BLBZXVMVEQ3QGUAZDREI) |
| XLM (Stellar Asset Contract) | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` | [view](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC) |
| USDC (Stellar Asset Contract) | `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA` | [view](https://stellar.expert/explorer/testnet/contract/CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA) |
> ℹ️ **These are the current, live testnet deployments** and supersede any previously published contract addresses for this project.

### Token Addresses (Stellar Testnet)

| Token | Type | Soroban address (SAC) | Classic issuer |
|---|---|---|---|
| XLM | Native Stellar asset (SAC) | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` | native |
| USDC | SEP-41 SAC over classic USDC | `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA` | `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5` |

> USDC is a SAC wrapping the classic asset issued by the address above — the G-address is used only for building `change_trust` trustline transactions, never for Soroban token calls.

User Feedback Implementation

The product went through a round of hands-on user feedback covering the marketing
site and the Swap / Liquidity / Portfolio app shell. Each row below maps the
feedback we received to the concrete change shipped for it and the commit that
contains that change.

## 👥 Level 5 User Onboarding

🔗 **Google Form:** [Google Form](https://docs.google.com/forms/d/e/1FAIpQLSeepO3hoKKHkP9ysz-5hoHqNLHKnWmTWujFGEL5B7sjOqAAyQ/viewform?usp=header)
📊 **Response Sheet:** [Response Sheet](https://docs.google.com/spreadsheets/d/1f1TMBLmPO_KDPSEhh22tdrCmSYe7jygxQjI-regL9fA/edit?usp=sharing)
---

## 📈 User Feedback & Improvements

| # | User Feedback | Implementation | Commit |
|---|---|---|---|
| 1 | Improve price accuracy and reduce inconsistencies between displayed values and actual pool state. | Updated liquidity pricing to use the pool's on-chain `sqrtPriceX64` and current tick, improving the accuracy of price-range and liquidity calculations. | [`614cb0e`](https://github.com/rishiisarkar/LuminaDex/commit/614cb0e2744660916e6c50a060a5f32c46647023) |
| 2 | Reduce transaction failures caused by slippage. | Added slippage-protected minimum token amounts when creating liquidity positions and improved validation before submitting transactions. | [`614cb0e`](https://github.com/rishiisarkar/LuminaDex/commit/614cb0e2744660916e6c50a060a5f32c46647023) |
| 3 | Make failed transactions easier to understand instead of showing unclear errors. | Added clearer validation and error handling for invalid price ranges, invalid liquidity amounts, insufficient XLM/USDC balances, and token authorization failures. | [`614cb0e`](https://github.com/rishiisarkar/LuminaDex/commit/614cb0e2744660916e6c50a060a5f32c46647023) |
| 4 | Improve USDC support and make token handling more reliable. | Added stronger USDC/XLM validation, fresh wallet balance checks, USDC trustline handling, correct token ordering verification, and official token assets throughout the UI. | [`614cb0e`](https://github.com/rishiisarkar/LuminaDex/commit/614cb0e2744660916e6c50a060a5f32c46647023) |
| 5 | Improve the experience when users do not have enough tokens to provide liquidity. | Added real-time XLM and USDC balance validation with detailed messages showing required amounts, available balances, and the XLM gas reserve requirement. | [`614cb0e`](https://github.com/rishiisarkar/LuminaDex/commit/614cb0e2744660916e6c50a060a5f32c46647023) |
| 6 | Improve mobile responsiveness, especially on smaller screens. | Refined responsive landing-page layouts, spacing, typography, sections, and visual behavior to provide a better experience across mobile and desktop devices. | [`52fae37`](https://github.com/rishiisarkar/LuminaDex/commit/52fae375cef49e9bdf4a4fa7740ccde36f1a1e86) |
| 7 | Make the application easier for beginners to understand and navigate. | Simplified the LuminaDex navigation and strengthened the landing-page presentation so users can more easily understand Swap, Liquidity, and Portfolio flows. | [`08320e7`](https://github.com/rishiisarkar/LuminaDex/commit/08320e7daa288be24e1550d5ac8a730063adddfa) |
| 8 | Improve the wallet connection experience and make wallet actions clearer. | Standardized wallet-related UI across the application, improved Connect Wallet presentation, and integrated the wallet experience consistently into the main application flow. | [`08320e7`](https://github.com/rishiisarkar/LuminaDex/commit/08320e7daa288be24e1550d5ac8a730063adddfa) |
| 9 | Polish the overall interface and make the product feel more modern. | Added a refined LuminaDex landing-page visual system with responsive styling, improved typography, animations, spacing, modern sections, and stronger visual hierarchy. | [`52fae37`](https://github.com/rishiisarkar/LuminaDex/commit/52fae375cef49e9bdf4a4fa7740ccde36f1a1e86) |
| 10 | Improve consistency across Swap, Liquidity, Portfolio, navigation, and token displays. | Unified the core frontend experience with LuminaDex branding, shared navigation, redesigned application pages, XLM/USDC assets, reusable components, and consistent styling while preserving existing functionality. | [`08320e7`](https://github.com/rishiisarkar/LuminaDex/commit/08320e7daa288be24e1550d5ac8a730063adddfa) |
## Smart Contract Activity 
<img width="1919" height="897" alt="image" src="https://github.com/user-attachments/assets/2a860d6b-a104-4994-b882-09fc6689d893" />

## Monitoring Dashboard
<div align="center">
  <img
    src="https://github.com/user-attachments/assets/def2319f-4edf-4e7d-a2f3-a892a44d5b13"
    alt="Screenshot from 2026-07-24 18-41-31"
    width="48%"
  />
  <img
    src="https://github.com/user-attachments/assets/9aff7f1e-2efa-4acc-a2eb-42207dd0c733"
    alt="Screenshot from 2026-07-24 18-41-45"
    width="48%"
  />
</div>

## 🧪 CI/CD (GitHub Actions — `.github/workflows/`)

| Workflow | Trigger | Steps |
|---|---|---|
| **`ci.yml`** | Push / PR to `main` | **contracts job:** `cargo fmt --check` → `cargo test` → `cargo build --target wasm32-unknown-unknown --release` → upload wasm.<br>**frontend job:** `npm ci` → `npm run lint` → `npm run typecheck` → `npm run test:ci` → `npm run build`. Fails on any lint/type/test/build error. |
| **`deploy.yml`** | Push to `main` + manual dispatch | **deploy-contract:** build wasm → `stellar contract deploy` (factory) on testnet.<br>**deploy-frontend:** `needs: deploy-contract` → `npm run build` with `NEXT_PUBLIC_*` → `vercel deploy --prod`. Deploy steps skip cleanly when secrets are absent. |
<img width="2556" height="1095" alt="image" src="https://github.com/user-attachments/assets/4a458330-b486-450f-93ee-8cdcc2c93619" />

## 📱 Mobile Responsive

<div align="center">
  <img src="https://github.com/user-attachments/assets/d2993f69-efa3-46e8-9dee-7424ffe43249" alt="Mobile Responsive Preview" width="300" />
</div>

### What This Project Builds

| Page | What it does |
|---|---|
| **Swap** | Trade XLM ↔ USDC. Auto-routing, slippage control, real-time price impact. |
| **Liquidity** | Create / manage / close LP positions with custom price ranges. |
| **Portfolio** | View your open positions, accumulated fees, and historical performance. |

### Target Environment

| Setting | Value |
|---|---|
| Network | Stellar Testnet |
| Smart Contract VM | Soroban (WASM) |
| Contract Language | Rust |
| Token pair | XLM (native) / USDC (SEP-41 on testnet) |
| Frontend | React + TypeScript + Stellar SDK |
| Wallet | Freighter (browser extension) |

## ⚠️ Why CLMM on Stellar

### Stellar's Native DEX Is Not Enough

Stellar already has a native order book (SDEX) and AMM (constant product). Neither supports concentrated liquidity:

- ❌ **SDEX** — an orderbook requiring active management
- ❌ **Native AMM** — spreads liquidity from 0 to ∞, making it capital-inefficient

### Why Soroban Changes Everything

Soroban (launched 2024) brings general-purpose smart contracts to Stellar, unlocking:

- **Arbitrary on-chain logic** — tick iteration, fixed-point math, position tracking
- **Composable DeFi** — contracts calling contracts
- **Custom token standards** — SEP-41 compliant tokens callable from contracts

### The XLM/USDC Pair

- The highest-volume pair on Stellar
- A stablecoin/volatile pair where concentrated liquidity shines most (LPs focus around the peg corridor)
- Fully available on testnet via Friendbot and Circle's testnet faucet

---

## 🧠 High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│  ┌──────────┐   ┌─────────────┐   ┌──────────────────────┐  │
│  │  /swap   │   │ /liquidity  │   │     /portfolio       │  │
│  └──────────┘   └─────────────┘   └──────────────────────┘  │
│       │                │                      │              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Stellar SDK + Freighter Wallet            │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────┘
                              │ XDR transactions
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   STELLAR TESTNET (Horizon + Soroban RPC)   │
│                                                             │
│  ┌──────────────┐   ┌────────────────────────────────────┐  │
│  │   Router     │   │         Factory Contract           │  │
│  │  Contract    │──▶│  deploy_pool · get_pool · pools[]  │  │
│  └──────┬───────┘   └────────────────┬───────────────────┘  │
│         │                            │ deploys               │
│         ▼                            ▼                       │
│  ┌──────────────────────────────────────────────────────┐    │
│  │                   Pool Contract                      │    │
│  │  ┌──────────┐ ┌───────────┐ ┌──────────────────┐    │    │
│  │  │  Slot0   │ │ Tick Map  │ │  Position Map     │    │    │
│  │  │ sqrtP    │ │ liqNet    │ │  (owner,tL,tH)    │    │    │
│  │  │ curTick  │ │ feeGrowth │ │  → {L, feeSnap}   │    │    │
│  │  └──────────┘ └───────────┘ └──────────────────┘    │    │
│  │  swap() · mint() · burn() · collect() · observe()   │    │
│  └──────────────────────────┬───────────────────────────┘   │
│                             │ token transfers                │
│         ┌───────────────────┴────────────────────┐          │
│         ▼                                        ▼          │
│  ┌─────────────┐                        ┌──────────────┐    │
│  │ XLM Native  │                        │  USDC SEP-41 │    │
│  │   Token     │                        │   Contract   │    │
│  └─────────────┘                        └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Contract Layer

| Contract | Purpose | Key Functions |
|---|---|---|
| `factory` | Deploys and tracks all pools | `deploy_pool`, `get_pool`, `set_fee_protocol` |
| `pool` | Core AMM logic | `swap`, `mint`, `burn`, `collect`, `observe` |
| `position_manager` | Wraps positions as transferable SEP-41 / NFT-style tokens | `mint_position`, `transfer`, `get_position` |
| `router` | User-facing entry; slippage checks | `exact_input`, `exact_output`, `quote` |
| `user_profile` | On-chain user profile registry | organized under `contracts/` |

### Frontend Layer

| Module | Tech | Purpose |
|---|---|---|
| `pages/Swap` | React + Stellar SDK | Swap UI, price quotes, transaction building |
| `pages/Liquidity` | React + Recharts | Range selector, deposit calculator, position list |
| `pages/Portfolio` | React + Recharts | Open positions, fee claims, P&L |
| `hooks/usePool` | React Query | Real-time pool state from Soroban RPC |
| `hooks/usePositions` | React Query | LP positions for connected wallet |
| `lib/math.ts` | TypeScript | Off-chain quote math (mirrors contract math) |
| `lib/stellar.ts` | Stellar SDK | Transaction building, signing, submission |

### Data Flow — Swap

```
User inputs "sell 100 XLM"
        │
        ▼
Frontend calls quote() on Router (Soroban simulation, no fee)
        │  returns: expected USDC out, price impact, route
        ▼
User confirms → Frontend builds Transaction:
  - invoke Router::exact_input(xlm_amount, min_usdc_out, deadline)
        │
        ▼
Freighter signs → Stellar SDK submits to testnet
        │
        ▼
Router validates slippage, calls Pool::swap()
        │
        ▼
Pool::swap() runs tick-crossing loop:
  1. Finds next initialized tick (bitmap lookup)
  2. compute_swap_step() for this segment
  3. Updates sqrt_price_x96, current_tick
  4. Crosses tick if boundary reached (updates L_active)
  5. Repeats until amount_in exhausted
        │
        ▼
Pool transfers USDC to user via SEP-41 token::transfer()
Pool accepts XLM via native transfer
        │
        ▼
Frontend polls Horizon for tx confirmation
Portfolio / Swap UI updates
```

---



## ⚙️ Environment Setup

`.env.testnet` — containing only the latest deployed contract addresses:

```env
NEXT_PUBLIC_STELLAR_NETWORK=TESTNET
NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_NETWORK_PASSPHRASE=Test SDF Network ; September 2015

NEXT_PUBLIC_FACTORY_ADDRESS=CCDUWTVMG6J4V6SZJBWKO5E24IEYHZEHXJZNIVKQURFN6DATWISOL72T
NEXT_PUBLIC_POOL_ADDRESS=CBR7MAQPM35KPK3ULM4FBLEQMQFJZC6N7YWXMPWPYWVPOL2OVNKKBPQV
NEXT_PUBLIC_ROUTER_ADDRESS=CBJR47MFKAATLVITCHAYDXEML4FB4HVTZXK4DPZQPWYNN3AG4GJU3ERD
NEXT_PUBLIC_POSITION_MANAGER_ADDRESS=CDARU3KCM2CKQLQ74V4NYJ6V5X6Q4IXLKJGSDEIOLEQAUOAYUQ27QKBH
NEXT_PUBLIC_PROFILE_CONTRACT_ADDRESS=CDCTJGULUEJSL3DBJQYD7DVQEA52J7QZDGY5EPDVIODBJQW532O3675U

NEXT_PUBLIC_XLM_ADDRESS=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
NEXT_PUBLIC_USDC_ADDRESS=CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA
```

---

## 📦 Smart Contract Folder Structure

```
contracts/
├── Cargo.toml                    # Rust workspace (factory, pool, position_manager, router, user_profile)
├── Makefile                      # build / test / deploy helpers
│
├── factory/
│   └── src/lib.rs                # deploy_pool, get_pool, registry
│
├── pool/
│   └── src/
│       ├── lib.rs                 # core CLMM: swap, mint, burn, collect, slot0
│       ├── swap.rs                # compute_swap_step, tick iteration loop
│       ├── tick.rs                # Tick CRUD, fee_growth_outside updates
│       ├── tick_bitmap.rs         # Bit-level next-tick lookup
│       ├── position.rs            # Position CRUD, fee growth inside
│       ├── storage.rs
│       ├── events.rs
│       ├── test.rs
│       └── math/
│           ├── sqrt_price.rs      # tick_to_sqrt_price, sqrt_price_to_tick
│           ├── liquidity.rs       # get_liquidity_for_amounts, get_amounts_for_liquidity
│           ├── fixed_point.rs     # Q64.96 operations
│           └── mod.rs
│
├── position_manager/
│   └── src/lib.rs                 # NFT-style LP position wrapper
│
├── router/
│   └── src/lib.rs                 # multi-hop / exact-in swap routing
│
└── user_profile/
    └── src/lib.rs                 # on-chain user profile registry
```

### Frontend Structure

```
frontend/
└── src/
    ├── app/                        # Route pages (Next.js App Router)
    │   └── (app)/
    │       ├── swap/page.tsx
    │       └── liquidity/new/page.tsx
    ├── pages/
    │   ├── Swap/
    │   ├── Liquidity/
    │   └── Portfolio/
    ├── components/
    │   └── liquidity/PositionCard.tsx
    ├── hooks/
    │   ├── usePool.ts
    │   ├── usePositions.ts
    │   ├── useSwapQuote.ts
    │   └── useWallet.ts
    ├── lib/
    │   ├── math.ts                 # off-chain mirrors of contract math
    │   ├── stellar.ts               # Stellar SDK helpers
    │   ├── transactions.ts          # tx building for swap/mint/burn/collect
    │   └── constants.ts             # contract addresses wired from NEXT_PUBLIC_* env vars
    └── App.tsx
```

---

## 🔗 Contract ↔ Frontend Function Mapping

| Contract fn (Rust) | Frontend caller (TypeScript) |
|---|---|
| `pool.swap` | `frontend/src/lib/transactions.ts` ← `app/(app)/swap/page.tsx`, `hooks/useSwapQuote.ts` |
| `pool.mint` / `position_manager.mint` | `frontend/src/lib/transactions.ts` ← `app/(app)/liquidity/new/page.tsx` |
| `pool.burn` / `pool.collect` | `frontend/src/lib/transactions.ts` ← `components/liquidity/PositionCard.tsx` |
| `pool.slot0` / `pool.liquidity` | `frontend/src/hooks/usePool.ts` (portfolio on-chain reads) |
| `router.exact_input_single` / `exact_output_single` | on-chain router (single-pool UI calls `pool.swap` directly) |

Contract IDs are wired through `frontend/src/lib/constants.ts` from `NEXT_PUBLIC_*` env vars (see [Environment Setup](#️-environment-setup)).

---

## 🧪 CI/CD (GitHub Actions — `.github/workflows/`)

| Workflow | Trigger | Steps |
|---|---|---|
| **`ci.yml`** | Push / PR to `main` | **contracts job:** `cargo fmt --check` → `cargo test` → `cargo build --target wasm32-unknown-unknown --release` → upload wasm.<br>**frontend job:** `npm ci` → `npm run lint` → `npm run typecheck` → `npm run test:ci` → `npm run build`. Fails on any lint/type/test/build error. |
| **`deploy.yml`** | Push to `main` + manual dispatch | **deploy-contract:** build wasm → `stellar contract deploy` (factory) on testnet.<br>**deploy-frontend:** `needs: deploy-contract` → `npm run build` with `NEXT_PUBLIC_*` → `vercel deploy --prod`. Deploy steps skip cleanly when secrets are absent. |

---

## 🖥️ Development Setup

### Prerequisites

```bash
# Rust + Soroban toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown
cargo install --locked stellar-cli

# Node.js 18+
nvm install 18

# Stellar CLI
stellar version  # should be 20.x+
```

### Build Contracts

```bash
cd contracts

# Build all contracts (workspace)
cargo build --target wasm32-unknown-unknown --release

# Optimize WASM (reduces size significantly)
stellar contract optimize --wasm target/wasm32-unknown-unknown/release/pool.wasm

# Run contract tests
cargo test
```

### Start Frontend

```bash
cd frontend
npm install
npm run dev  # starts on http://localhost:3000
```

### Deploy in Order (dependencies)

```bash
# 1. Set up testnet account
stellar keys generate rishii --network testnet
stellar keys fund rishii --network testnet   # Friendbot funds it

# 2. Deploy factory
stellar contract deploy \
  --wasm contracts/factory/target/wasm32-unknown-unknown/release/factory.wasm \
  --source rishii --network testnet --alias factory

# 3. Deploy pool implementation
stellar contract deploy \
  --wasm contracts/pool/target/wasm32-unknown-unknown/release/pool.wasm \
  --source rishii --network testnet --alias pool_impl

# 4. Deploy position manager
stellar contract deploy \
  --wasm contracts/position_manager/target/wasm32-unknown-unknown/release/position_manager.wasm \
  --source rishii --network testnet --alias position_manager

# 5. Deploy router
stellar contract deploy \
  --wasm contracts/router/target/wasm32-unknown-unknown/release/router.wasm \
  --source rishii --network testnet --alias router

# 6. Deploy user profile contract
stellar contract deploy \
  --wasm contracts/user_profile/target/wasm32-unknown-unknown/release/user_profile.wasm \
  --source rishii --network testnet --alias user_profile

# 7. Initialize the XLM/USDC pool at the live market price
npx ts-node scripts/init-pool.ts

# 8. Add seed liquidity for testnet demo
npx ts-node scripts/add-seed-liquidity.ts
```

---

## 🧾 The LP Flow — End to End

### Adding Liquidity

```
1. LP opens /liquidity page → fetches current price from pool.slot0()
2. LP sets a price range (ticks rounded to tick_spacing)
3. LP enters an amount of one token → frontend computes the other via
   L = amount / (√P − √P_lower)  and  amount_other = L × (1/√P − 1/√P_upper)
4. LP approves and signs → Router::mint() → PositionManager::mint() → Pool::mint()
5. Pool::mint() validates ticks, initializes tick bitmap bits, snapshots
   fee_growth_inside, writes the position, adds L to L_active if in range,
   and pulls both tokens from the LP
6. Position NFT minted with {pool, tick_lower, tick_upper, L}
7. Position appears in /portfolio as In Range ✓ with 0 uncollected fees
```

### Fee Collection

Fees accrue automatically. LPs can collect at any time without removing liquidity — `collectFees()` reads `pool.slot0()`, computes `feeGrowthInside`, and calls `router.collect({ positionId, recipient })`.

### Removing Liquidity — Two-Step

```
1. burn(tick_lower, tick_upper, liquidity_to_remove)
   → moves tokens from virtual reserve to "owed", decrements L_active
   → does NOT transfer tokens yet

2. collect(recipient, tick_lower, tick_upper, max_u128, max_u128)
   → transfers tokens_owed_0 + tokens_owed_1 + accumulated fees to LP

3. If fully removed → positionManager.burn(position_id) burns the NFT
```

### Rebalancing

When price drifts out of range, the position earns zero fees and becomes single-asset:

```
1. Remove all liquidity: burn() + collect()
2. Receive single asset
3. Swap ~50% back to the other token at current price
4. Re-mint at a new range centered around current price
5. New Position NFT minted
```

---

## 🔐 Security Considerations

| Area | Mitigation |
|---|---|
| **Reentrancy** | `unlocked` flag in `Slot0`, set before any external call (e.g. `token.transfer()`) and released after |
| **Price manipulation** | `sqrt_price_limit_x96` on every swap; TWAP oracle hooks via `observe()`; thinner liquidity naturally raises manipulation cost |
| **Integer overflow** | All math paths use `checked_add` / `checked_mul` / `checked_div`, never raw arithmetic |
| **Authorization** | Every LP operation calls `require_auth()` on the position owner; router checks `require_auth()` on the recipient |
| **Tick spacing** | All `mint()` tick inputs validated as multiples of `tick_spacing`; invalid ticks panic immediately |
| **Initial price manipulation** | Factory owner deploys and initializes the pool in the same transaction, with seeded liquidity added immediately |

---

## 🧪 Testing Strategy

- **Unit tests (Rust)** — exhaustive coverage of `tick_to_sqrt_price`, `compute_swap_step`, price-limit enforcement, `liquidityNet` invariants, and fee growth accrual.
- **Integration tests** — full LP lifecycle (`mint` → `swap` → `collect` → `burn_and_collect`) and global invariant checks (pool balance == sum of tokens owed + fee reserves).
- **Frontend tests** — unit tests for `lib/math.ts` (critical, since it mirrors contract math) plus a slower end-to-end suite against live testnet, run pre-release.

---

## 📡 Event Streaming & Real-Time Updates

| Contract | Event | Emitted on |
|---|---|---|
| `pool` | `swap` | every swap (amounts, new sqrt price, tick) |
| `pool` | `mint` | liquidity added to a range |
| `pool` | `burn` | liquidity removed |
| `pool` | `collect` | fees/tokens withdrawn |
| `factory` | `pool_created` | a new pool is deployed |

The frontend stays in sync via **TanStack Query polling + invalidation** (Soroban RPC has no native browser event push): `usePool`, `usePositions`, `useBalances` poll on an interval, and post-transaction success invalidates the relevant queries so the UI refreshes immediately instead of waiting for the next poll. Stale queries retry with backoff on RPC failure and refetch automatically on window refocus/reconnect.

---

## 💳 Wallet Integration (Freighter)

| File | Responsibility |
|---|---|
| `frontend/src/lib/stellar.ts` | `@stellar/freighter-api` calls — detect, connect, sign, submit |
| `frontend/src/hooks/useWallet.ts` | `useWallet()` → `{ address, isConnected, connect, disconnect, signAndSubmit }` |
| `frontend/src/lib/transactions.ts` | Builds and submits Soroban contract invocations (swap / mint / burn / collect) signed via Freighter |

Flow: detect Freighter → connect → build the relevant contract invocation → sign with Freighter → submit via Stellar SDK → poll Horizon for confirmation → refresh Swap / Liquidity / Portfolio views.

---

## 🎯 Known Limitations & Future Work

| Limitation | Impact | Future fix |
|---|---|---|
| Single pair (XLM/USDC only) | No multi-hop routing | Add more pools, router multi-hop support |
| No TWAP oracle exposed | Can't use pool price in other contracts | Add `observe()` + time-weighted observations |
| No protocol fee collection | Protocol earns 0 | Implement `collectProtocol()` |
| No position NFT transferability UI | LPs can't trade positions | Add Portfolio transfer flow |
| No auto-rebalance | Manual LP management | Add keeper/bot infrastructure |
| Soroban resource limits | Very large tick ranges may hit compute limits | Optimize tick bitmap, batch reads |

---

<div align="center">

*LuminaDex — concentrated liquidity, decentralized, on Stellar.*

</div>
