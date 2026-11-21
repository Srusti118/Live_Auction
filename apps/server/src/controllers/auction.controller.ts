import type { Request, Response } from 'express'
import crypto from 'crypto'
import { repository } from '../db/db'
import { BiddingEngine } from '../services/bidding.engine'
import { WebSocketService } from '../services/websocket.service'
import type { AuthenticatedRequest } from '../middleware/auth.middleware'
import type { Auction } from '../types'

export class AuctionController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const auctions = await repository.getAuctions()
      res.status(200).json({ auctions })
    } catch {
      res.status(500).json({ error: 'Failed to retrieve auctions' })
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const auction = await repository.getAuctionById(id)
      if (!auction) {
        res.status(404).json({ error: 'Auction not found' })
        return
      }

      const bids = await repository.getBidsForAuction(id)
      res.status(200).json({ auction, bids })
    } catch {
      res.status(500).json({ error: 'Failed to retrieve auction' })
    }
  }

  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const {
        title,
        description,
        imageUrl,
        startingPrice,
        reservePrice,
        minIncrement,
        durationMinutes,
      } = req.body

      if (!title || !startingPrice || !minIncrement) {
        res.status(400).json({ error: 'Missing required auction parameters' })
        return
      }

      const now = new Date()
      const duration = Number(durationMinutes) || 10
      const endTime = new Date(now.getTime() + duration * 60 * 1000)

      const auction: Auction = {
        id: crypto.randomUUID(),
        title,
        description: description || '',
        imageUrl:
          imageUrl ||
          'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=800',
        startingPrice: Number(startingPrice),
        reservePrice: Number(reservePrice) || Number(startingPrice),
        minIncrement: Number(minIncrement),
        currentPrice: 0,
        status: 'LIVE',
        startTime: now.toISOString(),
        endTime: endTime.toISOString(),
        originalEndTime: endTime.toISOString(),
        extensionsCount: 0,
        sellerId: req.user.id,
        winnerId: null,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      }

      await repository.saveAuction(auction)
      res.status(201).json({ auction })
    } catch {
      res.status(500).json({ error: 'Failed to create auction' })
    }
  }

  static async placeBid(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params
      const { amount } = req.body

      if (!amount || typeof amount !== 'number') {
        res.status(400).json({ error: 'Valid numeric bid amount is required' })
        return
      }

      const result = await BiddingEngine.submitBid({
        auctionId: id,
        bidderId: req.user.id,
        bidderName: req.user.name,
        amount,
      })

      if (result.success && result.bid) {
        WebSocketService.broadcastToRoom(id, {
          type: 'bid_accepted',
          auctionId: id,
          serverTime: Date.now(),
          data: {
            bid: result.bid,
            extended: result.extended,
            newEndTime: result.newEndTime,
          },
        })

        if (result.extended && result.newEndTime) {
          WebSocketService.broadcastToRoom(id, {
            type: 'auction_extended',
            auctionId: id,
            serverTime: Date.now(),
            data: {
              newEndTime: result.newEndTime,
              reason: 'Anti-sniping 30s extension triggered',
            },
          })
        }

        res.status(200).json(result)
      } else {
        res.status(400).json({ error: result.reason || 'Bid rejected' })
      }
    } catch {
      res.status(500).json({ error: 'Failed to process bid' })
    }
  }
}
