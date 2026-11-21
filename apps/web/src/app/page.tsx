'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ApiClient } from '@/lib/api'
import type { Auction, AuctionStatus } from '@/types'
import { StatusBadge } from '@/components/auction/StatusBadge'
import { Clock, ArrowRight, ShieldCheck, Flame } from 'lucide-react'

export default function HomePage() {
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [filter, setFilter] = useState<'ALL' | AuctionStatus>('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ApiClient.get<{ auctions: Auction[] }>('/auctions')
      .then((res) => setAuctions(res.auctions))
      .catch(() => setAuctions([]))
      .finally(() => setLoading(false))
  }, [])

  const filteredAuctions = auctions.filter((a) => {
    if (filter === 'ALL') return true
    return a.status === filter
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Editorial Catalog Header */}
      <div className="border-b border-slate-800 pb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 block mb-1">
            Official Live Bidding Room
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Curated Fine Sales & Auctions
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            Live competitive bidding with sub-millisecond atomic settlement and automatic 30-second anti-sniping protection.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="flex items-center space-x-3 text-xs font-mono text-slate-300">
          <div className="flex items-center space-x-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Strict Single Winner</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>+30s Anti-Sniping</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-medium">
          {(['ALL', 'LIVE', 'SCHEDULED', 'SOLD'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded text-xs transition ${
                filter === tab
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'ALL' ? 'All Lots' : tab}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {filteredAuctions.length} lots available
        </span>
      </div>

      {/* Catalogue Grid */}
      {loading ? (
        <div className="py-24 text-center text-slate-500 font-mono text-xs">
          Loading auction catalogue...
        </div>
      ) : filteredAuctions.length === 0 ? (
        <div className="py-24 text-center text-slate-500 font-mono text-xs">
          No items found in this section.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuctions.map((auction, idx) => {
            const currentPrice = auction.currentPrice || auction.startingPrice

            return (
              <Link
                key={auction.id}
                href={`/auctions/${auction.id}`}
                className="group bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 overflow-hidden flex flex-col transition hover:-translate-y-0.5 shadow-lg"
              >
                {/* Image */}
                <div className="relative h-60 w-full overflow-hidden bg-slate-950">
                  <img
                    src={auction.imageUrl}
                    alt={auction.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={auction.status} />
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur border border-slate-800 text-slate-300 text-[10px] font-mono">
                    Lot #{idx + 101}
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                      {auction.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {auction.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-500 block">
                        {auction.currentPrice > 0 ? 'Current High Bid' : 'Starting Bid'}
                      </span>
                      <span className="text-lg font-bold text-white font-mono">
                        ${currentPrice.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 text-xs font-semibold text-amber-400 group-hover:translate-x-0.5 transition-transform">
                      <span>Bid Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
