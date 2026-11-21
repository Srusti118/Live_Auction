'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { Auction, Bid, AuctionIntelligence, NotificationItem } from '@/types'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/ws'

interface UseAuctionSocketProps {
  auctionId: string
  initialAuction: Auction
  initialBids: Bid[]
  token: string | null
  currentUserId?: string
}

export const useAuctionSocket = ({
  auctionId,
  initialAuction,
  initialBids,
  token,
  currentUserId,
}: UseAuctionSocketProps) => {
  const [auction, setAuction] = useState<Auction>(initialAuction)
  const [bids, setBids] = useState<Bid[]>(initialBids)
  const [intelligence, setIntelligence] = useState<AuctionIntelligence>({
    activeViewers: 1,
    activeBidders: 0,
    bidsPerMinute: 0,
    priceHistory: [],
  })
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [serverTimeOffset, setServerTimeOffset] = useState<number>(0)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [lastExtensionNotice, setLastExtensionNotice] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const addNotification = useCallback(
    (title: string, message: string, type: NotificationItem['type'] = 'info') => {
      const item: NotificationItem = {
        id: Math.random().toString(36).substring(2, 9),
        title,
        message,
        type,
        timestamp: new Date().toLocaleTimeString(),
      }
      setNotifications((prev) => [item, ...prev.slice(0, 4)])
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== item.id))
      }, 5000)
    },
    []
  )

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        // Time sync handshake
        ws.send(
          JSON.stringify({
            type: 'time_sync',
            clientTimestamp: Date.now(),
          })
        )

        // Subscribe to auction
        ws.send(
          JSON.stringify({
            type: 'subscribe',
            auctionId,
            token: token || undefined,
          })
        )
      }

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          handleServerMessage(msg)
        } catch {
          // Ignore parse errors
        }
      }

      ws.onclose = () => {
        setIsConnected(false)
        reconnectTimeoutRef.current = setTimeout(() => {
          connect()
        }, 2000)
      }

      ws.onerror = () => {
        ws.close()
      }
    } catch {
      setIsConnected(false)
    }
  }, [auctionId, token])

  const handleServerMessage = useCallback(
    (msg: {
      type: string
      serverTime?: number
      clientTimestamp?: number
      data?: unknown
      auctionId?: string
    }) => {
      if (msg.serverTime) {
        const roundTrip = msg.clientTimestamp ? Date.now() - msg.clientTimestamp : 0
        const calculatedOffset = msg.serverTime - (Date.now() - roundTrip / 2)
        setServerTimeOffset(calculatedOffset)
      }

      switch (msg.type) {
        case 'bid_accepted': {
          const data = msg.data as {
            bid: Bid
            extended: boolean
            newEndTime?: string
          }

          setBids((prev) => [data.bid, ...prev])
          setAuction((prev) => ({
            ...prev,
            currentPrice: data.bid.amount,
            winnerId: data.bid.bidderId,
            endTime: data.newEndTime || prev.endTime,
            extensionsCount: data.extended
              ? prev.extensionsCount + 1
              : prev.extensionsCount,
          }))

          // Check if current user was outbid
          if (
            currentUserId &&
            data.bid.bidderId !== currentUserId &&
            auction.winnerId === currentUserId
          ) {
            addNotification(
              'You were outbid!',
              `${data.bid.bidderName} placed a bid of $${data.bid.amount.toLocaleString()}`,
              'warning'
            )
          }
          break
        }

        case 'bid_rejected': {
          const data = msg.data as { amount?: number; reason: string }
          addNotification('Bid Rejected', data.reason, 'error')
          break
        }

        case 'auction_extended': {
          const data = msg.data as { newEndTime: string; reason: string }
          setAuction((prev) => ({
            ...prev,
            endTime: data.newEndTime,
            extensionsCount: prev.extensionsCount + 1,
          }))
          setLastExtensionNotice('+30s Anti-Sniping Extension')
          addNotification(
            'Auction Extended!',
            'Late bid arrived in the last 30s. Extended by 30 seconds.',
            'warning'
          )
          setTimeout(() => setLastExtensionNotice(null), 4000)
          break
        }

        case 'status_changed': {
          const data = msg.data as {
            status: Auction['status']
            winnerId?: string
            finalPrice?: number
          }
          setAuction((prev) => ({
            ...prev,
            status: data.status,
            winnerId: data.winnerId || prev.winnerId,
            currentPrice: data.finalPrice || prev.currentPrice,
          }))

          if (data.status === 'SOLD') {
            addNotification(
              'Auction Ended',
              `Auction closed. Winner: ${data.winnerId === currentUserId ? 'YOU!' : 'Registered Bidder'}`,
              'success'
            )
          }
          break
        }

        case 'intelligence_update': {
          const data = msg.data as AuctionIntelligence
          setIntelligence(data)
          break
        }

        case 'user_notification': {
          const data = msg.data as { level: 'success' | 'warning' | 'info' | 'error'; message: string }
          addNotification('Bidding Update', data.message, data.level)
          break
        }
      }
    },
    [auction.winnerId, currentUserId, addNotification]
  )

  useEffect(() => {
    connect()
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
      if (wsRef.current) wsRef.current.close()
    }
  }, [connect])

  const placeBid = (amount: number): void => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      addNotification('Connection Error', 'WebSocket is not connected', 'error')
      return
    }

    wsRef.current.send(
      JSON.stringify({
        type: 'place_bid',
        auctionId,
        bidAmount: amount,
        token: token || undefined,
      })
    )
  }

  return {
    auction,
    bids,
    intelligence,
    notifications,
    serverTimeOffset,
    isConnected,
    lastExtensionNotice,
    placeBid,
  }
}
