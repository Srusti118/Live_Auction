export type Role = 'BIDDER' | 'ADMIN'

export type AuctionStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'LIVE'
  | 'ENDED'
  | 'SOLD'
  | 'UNSOLD'

export interface User {
  id: string
  email: string
  name: string
  passwordHash: string
  role: Role
  balance: number
  createdAt: string
}

export interface UserSummary {
  id: string
  email: string
  name: string
  role: Role
  balance: number
}

export interface Auction {
  id: string
  title: string
  description: string
  imageUrl: string
  startingPrice: number
  reservePrice: number
  minIncrement: number
  currentPrice: number
  status: AuctionStatus
  startTime: string
  endTime: string
  originalEndTime: string
  extensionsCount: number
  sellerId: string
  winnerId: string | null
  createdAt: string
  updatedAt: string
}

export interface Bid {
  id: string
  auctionId: string
  bidderId: string
  bidderName: string
  amount: number
  isAccepted: boolean
  reason: string | null
  createdAt: string
}

export interface BidValidationResult {
  success: boolean
  bid?: Bid
  reason?: string
  extended?: boolean
  newEndTime?: string
}

export interface AuctionIntelligence {
  activeViewers: number
  activeBidders: number
  bidsPerMinute: number
  priceHistory: Array<{
    timestamp: string
    price: number
    bidderName: string
  }>
}

export interface WsClientMessage {
  type: 'subscribe' | 'unsubscribe' | 'place_bid' | 'time_sync'
  auctionId?: string
  bidAmount?: number
  token?: string
  clientTimestamp?: number
}

export interface WsServerMessage {
  type:
    | 'time_sync_ack'
    | 'subscribed'
    | 'bid_accepted'
    | 'bid_rejected'
    | 'auction_extended'
    | 'status_changed'
    | 'intelligence_update'
    | 'user_notification'
  auctionId?: string
  serverTime?: number
  clientTimestamp?: number
  data?: unknown
}
