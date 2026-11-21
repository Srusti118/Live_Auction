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
import { ArrowLeft, Trophy, Wifi, WifiOff, ShieldCheck } from 'lucide-react'
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
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-slate-500 font-mono text-xs">
        Loading live bidding room...
      </div>
    )
  }

  if (!initialData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <p className="text-rose-400 font-bold">Lot not found or offline</p>
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs text-amber-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalogue</span>
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
      {/* Toast Notifications */}
      <NotificationToast notifications={notifications} />

      {/* Top Header & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-medium text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalogue</span>
        </Link>

        <div className="flex items-center space-x-3">
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-[11px] font-mono border ${
              isConnected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
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

      {/* Winning Hammer Celebration Banner */}
      {auction.status === 'SOLD' && auction.winnerId === currentUser?.id && (
        <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center space-x-4">
          <div className="p-3 bg-amber-500 text-slate-950 rounded-lg">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Congratulations — Winning Bidder!</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Final hammer price: ${auction.currentPrice.toLocaleString()}. Please complete settlement within 24 hours.
            </p>
          </div>
        </div>
      )}

      {/* Live Presence & Intelligence Stats */}
      <LiveIntelligence intelligence={intelligence} />

      {/* Main Grid: Left Details & Graph / Right Countdown & Bidding */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Photo, Overview, Pricing Table, Graph */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
            <div className="relative h-80 sm:h-96 w-full bg-slate-950">
              <img
                src={auction.imageUrl}
                alt={auction.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6 space-y-3">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {auction.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {auction.description}
              </p>

              {/* Auction Specs Table */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800/80 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Starting Bid</span>
                  <span className="text-white font-bold text-sm">
                    ${auction.startingPrice.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Reserve Price</span>
                  <span className="text-white font-bold text-sm">
                    ${auction.reservePrice.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Min Increment</span>
                  <span className="text-amber-400 font-bold text-sm">
                    +${auction.minIncrement.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Price Movement Chart */}
          <PriceMovementGraph data={intelligence.priceHistory} />

          {/* Dedicated Evaluator Test Console */}
          <ConcurrencySimulator
            auctionId={auctionId}
            onSimulateBids={handleSimulateBids}
          />
        </div>

        {/* Right Column (5 cols): Authoritative Countdown, Bidding Controls, Bid Log */}
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
