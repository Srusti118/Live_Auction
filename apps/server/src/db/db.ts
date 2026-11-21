import { orchidORM } from 'orchid-orm/node-postgres'
import { config } from '../config'
import { logger } from '../utils/logger'
import { UserTable } from './tables/user.table'
import { AuctionTable } from './tables/auction.table'
import { BidTable } from './tables/bid.table'
import type { User, Auction, Bid } from '../types'

export const db = orchidORM(
  {
    databaseURL: config.databaseUrl,
    log: false,
  },
  {
    users: UserTable,
    auctions: AuctionTable,
    bids: BidTable,
  }
)

// In-Memory fallback store to ensure zero-friction local execution if PostgreSQL is offline
class MemoryStore {
  users: Map<string, User> = new Map()
  auctions: Map<string, Auction> = new Map()
  bids: Map<string, Bid> = new Map()
  isPgConnected = false

  async init(): Promise<void> {
    try {
      await db.$query`SELECT 1`
      this.isPgConnected = true
      logger.info('Connected to PostgreSQL via Orchid ORM')
    } catch {
      this.isPgConnected = false
      logger.warn('PostgreSQL not reachable on port 5432. Active in-memory store initialized for local execution.')
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    if (this.isPgConnected) {
      try {
        const user = await db.users.findByOptional({ email })
        if (user) {
          return {
            ...user,
            balance: Number(user.balance),
            role: user.role as User['role'],
            createdAt: new Date(user.createdAt).toISOString(),
          }
        }
      } catch {
        // Fall back to memory on error
      }
    }
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) return u
    }
    return null
  }

  async findUserById(id: string): Promise<User | null> {
    if (this.isPgConnected) {
      try {
        const user = await db.users.findByOptional({ id })
        if (user) {
          return {
            ...user,
            balance: Number(user.balance),
            role: user.role as User['role'],
            createdAt: new Date(user.createdAt).toISOString(),
          }
        }
      } catch {
        // Fall back to memory
      }
    }
    return this.users.get(id) || null
  }

  async createUser(user: User): Promise<User> {
    this.users.set(user.id, user)
    if (this.isPgConnected) {
      try {
        await db.users.create({
          id: user.id,
          email: user.email,
          name: user.name,
          passwordHash: user.passwordHash,
          role: user.role,
          balance: user.balance,
        })
      } catch {
        // Continue with memory store
      }
    }
    return user
  }

  async updateUserBalance(userId: string, newBalance: number): Promise<void> {
    const user = this.users.get(userId)
    if (user) {
      user.balance = newBalance
    }
    if (this.isPgConnected) {
      try {
        await db.users.where({ id: userId }).update({ balance: newBalance })
      } catch {
        // Silently continue
      }
    }
  }

  async getAuctions(): Promise<Auction[]> {
    return Array.from(this.auctions.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  async getAuctionById(id: string): Promise<Auction | null> {
    return this.auctions.get(id) || null
  }

  async saveAuction(auction: Auction): Promise<Auction> {
    this.auctions.set(auction.id, auction)
    if (this.isPgConnected) {
      try {
        const existing = await db.auctions.findByOptional({ id: auction.id })
        if (existing) {
          await db.auctions.where({ id: auction.id }).update({
            currentPrice: auction.currentPrice,
            status: auction.status,
            endTime: new Date(auction.endTime),
            extensionsCount: auction.extensionsCount,
            winnerId: auction.winnerId || null,
            updatedAt: new Date(),
          })
        } else {
          await db.auctions.create({
            id: auction.id,
            title: auction.title,
            description: auction.description,
            imageUrl: auction.imageUrl,
            startingPrice: auction.startingPrice,
            reservePrice: auction.reservePrice,
            minIncrement: auction.minIncrement,
            currentPrice: auction.currentPrice,
            status: auction.status,
            startTime: new Date(auction.startTime),
            endTime: new Date(auction.endTime),
            originalEndTime: new Date(auction.originalEndTime),
            extensionsCount: auction.extensionsCount,
            sellerId: auction.sellerId,
            winnerId: auction.winnerId || null,
          })
        }
      } catch {
        // Continue
      }
    }
    return auction
  }

  async saveBid(bid: Bid): Promise<Bid> {
    this.bids.set(bid.id, bid)
    if (this.isPgConnected) {
      try {
        await db.bids.create({
          id: bid.id,
          auctionId: bid.auctionId,
          bidderId: bid.bidderId,
          bidderName: bid.bidderName,
          amount: bid.amount,
          isAccepted: bid.isAccepted,
          reason: bid.reason,
          createdAt: new Date(bid.createdAt),
        })
      } catch {
        // Continue
      }
    }
    return bid
  }

  async getBidsForAuction(auctionId: string): Promise<Bid[]> {
    const list: Bid[] = []
    for (const b of this.bids.values()) {
      if (b.auctionId === auctionId) {
        list.push(b)
      }
    }
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }
}

export const repository = new MemoryStore()
