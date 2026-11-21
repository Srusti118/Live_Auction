import { WebSocket, WebSocketServer } from 'ws'
import type { IncomingMessage } from 'http'
import jwt from 'jsonwebtoken'
import { config } from '../config'
import { logger } from '../utils/logger'
import { repository } from '../db/db'
import { BiddingEngine } from './bidding.engine'
import type { WsClientMessage, WsServerMessage, AuctionIntelligence } from '../types'

interface ClientMeta {
  ws: WebSocket
  userId?: string
  userName?: string
  activeRoom?: string
}

export class WebSocketService {
  private static wss: WebSocketServer
  private static clients: Map<WebSocket, ClientMeta> = new Map()
  private static roomViewers: Map<string, Set<WebSocket>> = new Map()

  static initialize(wss: WebSocketServer): void {
    this.wss = wss

    wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      this.handleConnection(ws, req)
    })

    // Broadcast periodic intelligence updates every 2 seconds
    setInterval(() => {
      this.broadcastIntelligenceUpdates()
    }, 2000)

    logger.info('WebSocketService initialized and listening for connections')
  }

  private static handleConnection(ws: WebSocket, req: IncomingMessage): void {
    const meta: ClientMeta = { ws }
    this.clients.set(ws, meta)

    ws.on('message', async (data: Buffer | string) => {
      try {
        const message: WsClientMessage = JSON.parse(data.toString())
        await this.handleClientMessage(ws, message)
      } catch (err) {
        logger.error('Failed to parse WebSocket message:', err)
      }
    })

    ws.on('close', () => {
      this.handleDisconnect(ws)
    })

    ws.on('error', (err) => {
      logger.error('WebSocket connection error:', err)
    })
  }

  private static async handleClientMessage(
    ws: WebSocket,
    msg: WsClientMessage
  ): Promise<void> {
    const meta = this.clients.get(ws)
    if (!meta) return

    // Verify token if supplied
    if (msg.token && !meta.userId) {
      try {
        const decoded = jwt.verify(msg.token, config.jwtSecret) as {
          id: string
          name: string
        }
        meta.userId = decoded.id
        meta.userName = decoded.name
      } catch {
        // Invalid token
      }
    }

    switch (msg.type) {
      case 'time_sync': {
        const response: WsServerMessage = {
          type: 'time_sync_ack',
          serverTime: Date.now(),
          clientTimestamp: msg.clientTimestamp,
        }
        ws.send(JSON.stringify(response))
        break
      }

      case 'subscribe': {
        if (!msg.auctionId) return
        this.subscribeToRoom(ws, msg.auctionId)
        const response: WsServerMessage = {
          type: 'subscribed',
          auctionId: msg.auctionId,
          serverTime: Date.now(),
        }
        ws.send(JSON.stringify(response))
        break
      }

      case 'unsubscribe': {
        if (meta.activeRoom) {
          this.unsubscribeFromRoom(ws, meta.activeRoom)
        }
        break
      }

      case 'place_bid': {
        if (!msg.auctionId || !msg.bidAmount) return
        if (!meta.userId || !meta.userName) {
          ws.send(
            JSON.stringify({
              type: 'bid_rejected',
              auctionId: msg.auctionId,
              data: { reason: 'Authentication required to place bid' },
            })
          )
          return
        }

        const result = await BiddingEngine.submitBid({
          auctionId: msg.auctionId,
          bidderId: meta.userId,
          bidderName: meta.userName,
          amount: msg.bidAmount,
        })

        if (result.success && result.bid) {
          // Notify room of accepted bid
          this.broadcastToRoom(msg.auctionId, {
            type: 'bid_accepted',
            auctionId: msg.auctionId,
            serverTime: Date.now(),
            data: {
              bid: result.bid,
              extended: result.extended,
              newEndTime: result.newEndTime,
            },
          })

          // If extended, broadcast extension event specifically
          if (result.extended && result.newEndTime) {
            this.broadcastToRoom(msg.auctionId, {
              type: 'auction_extended',
              auctionId: msg.auctionId,
              serverTime: Date.now(),
              data: {
                newEndTime: result.newEndTime,
                reason: 'Anti-sniping 30s extension triggered',
              },
            })
          }

          // Send confirmation back to the winning bidder
          ws.send(
            JSON.stringify({
              type: 'user_notification',
              data: {
                level: 'success',
                message: `You placed the highest bid of $${result.bid.amount.toFixed(2)}!`,
              },
            })
          )
        } else {
          // Send rejection feedback directly to the bidder
          ws.send(
            JSON.stringify({
              type: 'bid_rejected',
              auctionId: msg.auctionId,
              serverTime: Date.now(),
              data: {
                amount: msg.bidAmount,
                reason: result.reason || 'Bid rejected',
              },
            })
          )
        }
        break
      }
    }
  }

  static subscribeToRoom(ws: WebSocket, auctionId: string): void {
    const meta = this.clients.get(ws)
    if (meta && meta.activeRoom && meta.activeRoom !== auctionId) {
      this.unsubscribeFromRoom(ws, meta.activeRoom)
    }

    if (meta) {
      meta.activeRoom = auctionId
    }

    if (!this.roomViewers.has(auctionId)) {
      this.roomViewers.set(auctionId, new Set())
    }
    this.roomViewers.get(auctionId)!.add(ws)

    // Trigger instant count update
    this.sendRoomIntelligence(auctionId)
  }

  static unsubscribeFromRoom(ws: WebSocket, auctionId: string): void {
    const set = this.roomViewers.get(auctionId)
    if (set) {
      set.delete(ws)
      if (set.size === 0) {
        this.roomViewers.delete(auctionId)
      }
    }
    const meta = this.clients.get(ws)
    if (meta && meta.activeRoom === auctionId) {
      meta.activeRoom = undefined
    }
  }

  private static handleDisconnect(ws: WebSocket): void {
    const meta = this.clients.get(ws)
    if (meta?.activeRoom) {
      this.unsubscribeFromRoom(ws, meta.activeRoom)
    }
    this.clients.delete(ws)
  }

  static broadcastToRoom(auctionId: string, message: WsServerMessage): void {
    const set = this.roomViewers.get(auctionId)
    if (!set) return
    const payload = JSON.stringify(message)

    for (const ws of set) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload)
      }
    }
  }

  static broadcastGlobal(message: WsServerMessage): void {
    const payload = JSON.stringify(message)
    for (const [ws] of this.clients) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload)
      }
    }
  }

  private static async broadcastIntelligenceUpdates(): Promise<void> {
    for (const auctionId of this.roomViewers.keys()) {
      await this.sendRoomIntelligence(auctionId)
    }
  }

  private static async sendRoomIntelligence(auctionId: string): Promise<void> {
    const viewersCount = this.roomViewers.get(auctionId)?.size || 0
    const bids = await repository.getBidsForAuction(auctionId)

    // Calculate unique bidders
    const uniqueBidders = new Set(bids.map((b) => b.bidderId)).size

    // Calculate bids per minute over the last 60 seconds
    const oneMinuteAgo = Date.now() - 60000
    const recentBids = bids.filter(
      (b) => new Date(b.createdAt).getTime() >= oneMinuteAgo
    )
    const bidsPerMinute = recentBids.length

    // Price history for graph (up to 25 data points)
    const priceHistory = bids
      .filter((b) => b.isAccepted)
      .slice(0, 25)
      .reverse()
      .map((b) => ({
        timestamp: b.createdAt,
        price: b.amount,
        bidderName: b.bidderName,
      }))

    const intelligence: AuctionIntelligence = {
      activeViewers: viewersCount,
      activeBidders: uniqueBidders,
      bidsPerMinute,
      priceHistory,
    }

    this.broadcastToRoom(auctionId, {
      type: 'intelligence_update',
      auctionId,
      serverTime: Date.now(),
      data: intelligence,
    })
  }
}
