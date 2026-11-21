import { repository } from '../db/db'
import { logger } from '../utils/logger'
import { WebSocketService } from './websocket.service'

export class LifecycleService {
  private static intervalHandle: NodeJS.Timeout | null = null

  static start(): void {
    if (this.intervalHandle) return

    logger.info('Starting Auction Lifecycle scheduler (tick: 1s)')
    this.intervalHandle = setInterval(async () => {
      await this.tick()
    }, 1000)
  }

  static stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle)
      this.intervalHandle = null
    }
  }

  private static async tick(): Promise<void> {
    const auctions = await repository.getAuctions()
    const now = Date.now()

    for (const auction of auctions) {
      const startTime = new Date(auction.startTime).getTime()
      const endTime = new Date(auction.endTime).getTime()

      // 1. Transition SCHEDULED -> LIVE
      if (auction.status === 'SCHEDULED' && now >= startTime && now < endTime) {
        auction.status = 'LIVE'
        auction.updatedAt = new Date().toISOString()
        await repository.saveAuction(auction)
        logger.info(`Auction ${auction.id} is now LIVE`)

        WebSocketService.broadcastToRoom(auction.id, {
          type: 'status_changed',
          auctionId: auction.id,
          serverTime: now,
          data: { status: 'LIVE' },
        })
      }

      // 2. Transition LIVE -> ENDED -> SOLD / UNSOLD
      if (auction.status === 'LIVE' && now >= endTime) {
        const bids = await repository.getBidsForAuction(auction.id)
        const highestAcceptedBid = bids.find((b) => b.isAccepted)

        if (highestAcceptedBid && highestAcceptedBid.amount >= auction.reservePrice) {
          auction.status = 'SOLD'
          auction.winnerId = highestAcceptedBid.bidderId
          auction.currentPrice = highestAcceptedBid.amount
          logger.info(
            `Auction ${auction.id} ENDED: SOLD to ${highestAcceptedBid.bidderName} for $${highestAcceptedBid.amount}`
          )
        } else {
          auction.status = 'UNSOLD'
          logger.info(
            `Auction ${auction.id} ENDED: UNSOLD (Reserve price $${auction.reservePrice} not met or no bids)`
          )
        }

        auction.updatedAt = new Date().toISOString()
        await repository.saveAuction(auction)

        WebSocketService.broadcastToRoom(auction.id, {
          type: 'status_changed',
          auctionId: auction.id,
          serverTime: now,
          data: {
            status: auction.status,
            winnerId: auction.winnerId,
            finalPrice: auction.currentPrice,
          },
        })
      }
    }
  }
}
