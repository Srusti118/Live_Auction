import crypto from 'crypto'
import { config } from '../config'
import { repository } from '../db/db'
import { logger } from '../utils/logger'
import type { Auction, Bid, BidValidationResult } from '../types'

interface BidRequest {
  auctionId: string
  bidderId: string
  bidderName: string
  amount: number
}

export class BiddingEngine {
  private static queues: Map<string, Promise<unknown>> = new Map()

  static async submitBid(request: BidRequest): Promise<BidValidationResult> {
    const { auctionId } = request
    const existingQueue = this.queues.get(auctionId) || Promise.resolve()

    const queueOperation = existingQueue
      .then(async () => {
        return await this.processBidAtomically(request)
      })
      .catch((error) => {
        logger.error(`Error processing atomic bid for auction ${auctionId}:`, error)
        return {
          success: false,
          reason: 'Internal processing error',
        }
      })

    this.queues.set(auctionId, queueOperation)
    return queueOperation
  }

  private static async processBidAtomically(request: BidRequest): Promise<BidValidationResult> {
    const { auctionId, bidderId, bidderName, amount } = request
    const auction = await repository.getAuctionById(auctionId)

    if (!auction) {
      return { success: false, reason: 'Auction not found' }
    }

    const now = Date.now()
    const endTimeMs = new Date(auction.endTime).getTime()
    const startTimeMs = new Date(auction.startTime).getTime()

    // 1. Status and Timing Checks
    if (auction.status !== 'LIVE' || now < startTimeMs) {
      return { success: false, reason: 'Auction is not live' }
    }

    if (now >= endTimeMs) {
      return { success: false, reason: 'Auction has already ended' }
    }

    // 2. Self-bid prevention
    if (auction.winnerId === bidderId && auction.currentPrice > 0) {
      return { success: false, reason: 'You already hold the highest bid' }
    }

    // 3. User balance check
    const user = await repository.findUserById(bidderId)
    if (!user || user.balance < amount) {
      return { success: false, reason: 'Insufficient wallet balance' }
    }

    // 4. Minimum Increment & Price validation
    const minRequired =
      auction.currentPrice === 0
        ? auction.startingPrice
        : auction.currentPrice + auction.minIncrement

    if (amount < minRequired) {
      return {
        success: false,
        reason: `Bid must be at least $${minRequired.toFixed(2)}`,
      }
    }

    // 5. Anti-sniping calculation (last 30 seconds threshold)
    const remainingMs = endTimeMs - now
    let extended = false
    let newEndTime = auction.endTime

    if (remainingMs <= config.antiSnipingThresholdSeconds * 1000) {
      extended = true
      const extendedMs = endTimeMs + config.antiSnipingExtensionSeconds * 1000
      newEndTime = new Date(extendedMs).toISOString()
      auction.endTime = newEndTime
      auction.extensionsCount += 1
      logger.info(
        `Anti-sniping triggered for auction ${auction.id}. Extended by ${config.antiSnipingExtensionSeconds}s to ${newEndTime}`
      )
    }

    // 6. Update Auction State
    auction.currentPrice = amount
    auction.winnerId = bidderId
    auction.updatedAt = new Date().toISOString()

    const bid: Bid = {
      id: crypto.randomUUID(),
      auctionId,
      bidderId,
      bidderName,
      amount,
      isAccepted: true,
      reason: null,
      createdAt: new Date().toISOString(),
    }

    await repository.saveAuction(auction)
    await repository.saveBid(bid)

    return {
      success: true,
      bid,
      extended,
      newEndTime,
    }
  }
}
