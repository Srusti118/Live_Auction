'use client'

import React, { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { ApiClient } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useAuctionSocket } from '@/hooks/useAuctionSocket'
import { StatusBadge } from '@/components/auction/StatusBadge'
import { CountdownTimer } from '@/components/auction/CountdownTimer'
import { BiddingControls } from '@/components/auction/BiddingControls'
import { BidHistory } from '@/components/auction/BidHistory'
import { PriceMovementGraph } from '@/components/auction/PriceMovementGraph'
import { LiveIntelligence } from '@/components/auction/LiveIntelligence'
import { NotificationToast } from '@/components/ui/NotificationToast'
import { ConcurrencySimulator } from '@/components/ui/ConcurrencySimulator'
import { ArrowLeft, Trophy, Wifi, WifiOff } from 'lucide-react'
import type { Auction, Bid } from '@/types'

export default function AuctionArenaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const auctionId = resolvedParams.id

  const { user, token, refreshProfile } = useAuth()
  const [initialData, setInitialData] = useState<{
    auction: Auction
    bids: Bid[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ApiClient.get<{ auction: Auction; bids: Bid[] }>(`/auctions/${auctionId}`)
      .then((res) => {
        setInitialData(res)
      })
      .catch(() => {
        setInitialData(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [auctionId])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-slate-400 text-xs">
        Loading auction room...
      </div>
    )
  }

  if (!initialData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <p className="text-slate-700 font-semibold text-base">Auction not found</p>
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs text-blue-600 hover:underline font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalog</span>
        </Link>
      </div>
    )
  }

  return (
    <AuctionArenaContent
      auctionId={auctionId}
      initialAuction={initialData.auction}
      initialBids={initialData.bids}
      token={token}
      currentUser={user}
      onRefreshProfile={refreshProfile}
    />
  )
}

interface ContentProps {
  auctionId: string
  initialAuction: Auction
  initialBids: Bid[]
  token: string | null
  currentUser: ReturnType<typeof useAuth>['user']
  onRefreshProfile: () => Promise<void>
}

const AuctionArenaContent: React.FC<ContentProps> = ({
  auctionId,
  initialAuction,
  initialBids,
  token,
  currentUser,
  onRefreshProfile,
}) => {
  const {
    auction,
    bids,
    intelligence,
    notifications,
    serverTimeOffset,
    isConnected,
    lastExtensionNotice,
    placeBid,
  } = useAuctionSocket({
    auctionId,
    initialAuction,
    initialBids,
    token,
    currentUserId: currentUser?.id,
  })

  const isWinning = currentUser?.id === auction.winnerId && auction.currentPrice > 0

  const handleSimulateBids = (count: number) => {
    const baseIncrement = auction.minIncrement
    for (let i = 0; i < count; i++) {
      const simAmount = auction.currentPrice + (i + 1) * baseIncrement
      setTimeout(() => {
        placeBid(simAmount)
      }, i * 20)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Notifications */}
      <NotificationToast notifications={notifications} />

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Auctions</span>
        </Link>

        <div className="flex items-center space-x-3">
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs border ${
              isConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {isConnected ? (
              <>
                <Wifi className="w-3.5 h-3.5" />
                <span>Live Feed Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span>Reconnecting...</span>
              </>
            )}
          </div>
          <StatusBadge status={auction.status} />
        </div>
      </div>

      {/* Winner Banner */}
      {auction.status === 'SOLD' && auction.winnerId === currentUser?.id && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-lg">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-emerald-950">Congratulations — You Won This Auction!</h2>
            <p className="text-xs text-emerald-800">
              Final hammer price: ${auction.currentPrice.toLocaleString()}. Please complete settlement within 24 hours.
            </p>
          </div>
        </div>
      )}

      {/* Live Presence Bar */}
      <LiveIntelligence intelligence={intelligence} />

      {/* Main Grid: Left Details & Graph / Right Bidding Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Picture, Details, Specs, Graph */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
            <div className="relative h-80 sm:h-96 w-full bg-slate-100">
              <img
                src={auction.imageUrl}
                alt={auction.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6 space-y-3">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {auction.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {auction.description}
              </p>

              {/* Specs */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Starting Bid</span>
                  <span className="text-slate-900 font-bold text-sm">
                    ${auction.startingPrice.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Reserve Price</span>
                  <span className="text-slate-900 font-bold text-sm">
                    ${auction.reservePrice.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Min Increment</span>
                  <span className="text-slate-900 font-bold text-sm">
                    +${auction.minIncrement.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Price Movement Graph */}
          <PriceMovementGraph data={intelligence.priceHistory} />

          {/* Concurrency Simulator */}
          <ConcurrencySimulator
            auctionId={auctionId}
            onSimulateBids={handleSimulateBids}
          />
        </div>

        {/* Right Column (5 cols): Timer, Bid Controls, Bid History */}
        <div className="lg:col-span-5 space-y-6">
          <CountdownTimer
            endTime={auction.endTime}
            serverTimeOffset={serverTimeOffset}
            extensionsCount={auction.extensionsCount}
            status={auction.status}
            lastExtensionNotice={lastExtensionNotice}
          />

          <BiddingControls
            auction={auction}
            isWinning={isWinning}
            userBalance={currentUser?.balance || 0}
            onPlaceBid={placeBid}
            isConnected={isConnected}
          />

          <BidHistory bids={bids} currentUserId={currentUser?.id} />
        </div>
      </div>
    </div>
  )
}
