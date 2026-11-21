export type Role = 'BIDDER' | 'ADMIN'

export type AuctionStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'LIVE'
  | 'ENDED'
  | 'SOLD'
  | 'UNSOLD'

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

export interface NotificationItem {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: string
}
