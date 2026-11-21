'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ApiClient } from '@/lib/api'
import type { Auction, AuctionStatus } from '@/types'
import { StatusBadge } from '@/components/auction/StatusBadge'
import { ArrowRight, ShieldCheck, Clock } from 'lucide-react'

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
      {/* Editorial Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Live & Upcoming Auctions
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-xl">
            Live bidding with server-synchronized timers, dynamic 30-second anti-sniping protection, and guaranteed single-winner resolution.
          </p>
        </div>

        {/* Feature Badges */}
        <div className="flex items-center space-x-2 text-xs text-slate-600">
          <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Guaranteed Single Winner</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
            <Clock className="w-4 h-4 text-slate-600" />
            <span>+30s Anti-Sniping</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
          {(['ALL', 'LIVE', 'SCHEDULED', 'SOLD'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded transition ${
                filter === tab
                  ? 'bg-white text-slate-900 font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'ALL' ? 'All Lots' : tab}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {filteredAuctions.length} auctions listed
        </span>
      </div>

      {/* Grid of Auction Cards */}
      {loading ? (
        <div className="py-24 text-center text-slate-400 text-xs">
          Loading catalog...
        </div>
      ) : filteredAuctions.length === 0 ? (
        <div className="py-24 text-center text-slate-400 text-xs">
          No items found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuctions.map((auction, idx) => {
            const currentPrice = auction.currentPrice || auction.startingPrice

            return (
              <Link
                key={auction.id}
                href={`/auctions/${auction.id}`}
                className="group bg-white rounded-xl border border-slate-200 hover:border-slate-300 overflow-hidden flex flex-col transition hover:shadow-md"
              >
                {/* Photo */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                  <img
                    src={auction.imageUrl}
                    alt={auction.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                  />
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={auction.status} />
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-white/90 backdrop-blur border border-slate-200 text-slate-700 text-xs font-medium shadow-sm">
                    Lot #{idx + 101}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {auction.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {auction.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 block font-medium">
                        {auction.currentPrice > 0 ? 'Current Bid' : 'Starting Price'}
                      </span>
                      <span className="text-lg font-bold text-slate-900">
                        ${currentPrice.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      <span>View Lot</span>
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
