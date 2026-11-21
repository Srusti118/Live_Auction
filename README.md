# Live Auction Platform — High-Velocity, Ultra-Low Latency Arena

An enterprise-grade, real-time live auction platform engineered to handle extreme contention, high-concurrency bidding, dynamic anti-sniping extensions, and strict single-winner resolution.

Built with **React**, **Next.js 15 (App Router)**, **Node.js**, **Express**, **WebSocket (`ws`)**, and **PostgreSQL (via Orchid ORM & pgAdmin)**.

---

## Deliverable 1: Architectural Design Note

### How to Scale to 50,000 Concurrent Auctions with up to 200,000 People Watching One

1. **Edge-Terminated WebSocket Fan-Out via Distributed Pub/Sub**:
   Broadcasting updates directly to 200,000 concurrent watchers from a single monolithic server saturates CPU and network socket I/O. In high-scale production, client connections are terminated at a geographically distributed edge gateway tier (e.g., edge clusters running lightweight WebSocket brokers). The core auction engine publishes an update once (~100 bytes) to a Redis/NATS Pub/Sub cluster, which fans out hierarchically to edge nodes for local client delivery.

2. **Partitioned In-Memory Auction Sharding (Single-Writer Actor Model)**:
   50,000 active auctions are sharded across worker nodes using consistent hashing on `auction_id`. Each auction is managed by an isolated in-memory actor process. All incoming bids for a specific auction route directly to its designated shard, guaranteeing serialized, non-blocking, sub-millisecond bid execution without distributed lock contention or deadlocks.

3. **Write-Behind Log-Structured Persistence (CQRS)**:
   During the final 10 seconds of a popular auction, thousands of transient or outbid bids arrive per second. Writing every transient bid synchronously to relational storage creates severe database I/O bottlenecks. The in-memory auction engine accepts or rejects bids immediately, streams accepted state transitions to an append-only distributed log (Kafka or Redis Streams), and a decoupled consumer pool flushes batches to PostgreSQL asynchronously.

4. **Bandwidth Optimization & Differential State Broadcasting**:
   Broadcasting full JSON state objects to 200,000 watchers at high frequency consumes excessive outbound bandwidth. We transmit compact binary or delta packets (e.g., `[auctionId, currentPrice, bidderId, remainingMs, version]`, ~40 bytes per tick). High-frequency viewer updates are throttled to 50–100ms intervals, while maintaining microsecond precision for bid placement order.

5. **Dynamic Soft-Close Scheduling via Hierarchical Timing Wheels**:
   Managing 50,000 concurrent active countdown timers is handled using an in-memory hierarchical timing wheel or a sorted set of expiration timestamps (`ZSET`). When an anti-sniping bid lands within the last 30 seconds, only the node's memory pointer and expiration score are updated in $O(1)$ time, eliminating per-auction OS timers.

6. **Ingress Rate Limiting & Cryptographic Idempotency**:
   Edge gateways enforce token-bucket rate limits per user/IP (e.g., max 5 bids/sec per bidder) and deduplicate retries using UUIDv4 idempotency keys to shield the core engine from client network retries during peak contention.

---

## Deliverable 2: The Working Project Features

### Core Bidding & Lifecycle Engine
- **Atomic Concurrency Guarantee**: Bids are queued in an in-memory sequential FIFO pipeline per auction, guaranteeing zero race conditions and strictly **one winner**.
- **Dynamic Anti-Sniping Soft Close**: Any bid placed in the final 30 seconds automatically extends the auction duration by 30 seconds.
- **Server-Authoritative Clock Synchronization**: Uses NTP-style round-trip offset calculations to prevent client clock tampering.
- **Auction Lifecycle State Machine**: Full automated transition through `DRAFT` → `SCHEDULED` → `LIVE` → `ENDED` → `SOLD` / `UNSOLD`.

### Real-Time Live Intelligence & Standout Features
- **Live WebSocket Feed**: Sub-second broadcast of bids, winners, and extensions.
- **Real-Time Intelligence Dashboard**:
  - Live active viewer presence counter.
  - Unique active bidders counter.
  - Rolling bid velocity (bids per minute).
  - Dynamic SVG price movement chart (Recharts).
- **Comprehensive Notification System**: Instant toasts and visual indicators for outbid alerts, winning status, and ending warnings.
- **Embedded Concurrency Stress Simulator**: A 1-click test button in the UI allowing evaluators to fire 10 to 25 simultaneous bids within milliseconds to test contention resistance live on screen.
- **Authentication & RBAC**: JWT-based authentication with demo user quick-switching (Alice, Bob, Charlie, Admin).

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, Tailwind CSS, Lucide Icons, Recharts |
| **Backend** | Node.js, Express, TypeScript, `ws` (native WebSockets), JWT, bcryptjs |
| **Database & ORM** | PostgreSQL, **Orchid ORM** (table schemas & queries), inspectable via **pgAdmin** |
| **Engine** | In-Memory Per-Auction Serial FIFO Queue + Persistence Layer |

---

## Quick Start & Local Setup

### 1. Prerequisites
- Node.js v18+ (tested on v22)
- npm or pnpm

### 2. Install Dependencies
```bash
npm install
```

### 3. PostgreSQL & Orchid ORM Setup (Optional / Ready for pgAdmin)
The application comes pre-configured with Orchid ORM table schemas (`apps/server/src/db/tables/*`) and an SQL migration script:
- [apps/server/src/db/init.sql](apps/server/src/db/init.sql)

To load into PostgreSQL via **pgAdmin**:
1. Open pgAdmin and create a database named `live_auction`.
2. Open Query Tool and execute `apps/server/src/db/init.sql`.
3. Set your connection URL in `apps/server/.env` (default: `postgresql://postgres:postgres@localhost:5432/live_auction`).

> **Zero-Friction Local Execution**: If PostgreSQL is not running locally, the server automatically initializes its persistent in-memory repository, allowing the full stack to run without needing an active database container.

### 4. Run the Platform
In the root directory, start both the backend server and the Next.js frontend concurrently:
```bash
# Terminal 1: Run Backend Server (port 4000)
npm run dev:server

# Terminal 2: Run Next.js Frontend (port 3000)
npm run dev:web
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Collector Accounts & Demo Credentials

For seamless evaluation, click the user profile in the top-right corner or the **"+ Budget"** button to adjust bidding funds dynamically:

| Collector | Email | Password | Role | Starting Budget |
|---|---|---|---|---|
| **James Henderson** | `james@collector.com` | `password123` | Private Collector | $75,000 |
| **Sarah Jenkins** | `sarah@collector.com` | `password123` | Art & Antiquities Collector | $120,000 |
| **Michael Chang** | `michael@collector.com` | `password123` | Horology Enthusiast | $50,000 |
| **Arthur Phillips** | `phillips@auctioneer.com` | `password123` | Auction Specialist (Admin) | $1,000,000 |

> **Custom Budget Control**: You can deposit funds or set any exact budget amount at any time using the **"+ Budget"** button in the navigation bar.

---

## Automated Concurrency Stress Test

To verify that the engine accepts and rejects concurrent bids atomically without race conditions, run the included stress test script:

```bash
npm run stress-test
```

**Stress Test Verification Output:**
```
[INFO] Starting Concurrency Stress Test on Auction "1968 Rolex Submariner Ref. 5513"
[INFO] Initial Price: $9500
[INFO] Firing 50 simultaneous bids...
[INFO] Anti-sniping triggered. Extended by 30s
[INFO] --- STRESS TEST RESULTS ---
[INFO] Total Bids Processed: 50 in 1ms (50000.0 bids/sec)
[INFO] Accepted Bids: 49
[INFO] Rejected Bids: 1
[INFO] Final Current Price: $22000
[INFO] Extensions Count: 1
[INFO] SUCCESS: Concurrency test passed with zero race conditions and verified atomic single-winner state!
```
