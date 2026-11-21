'use client'

import React from 'react'
import type { Bid } from '@/types'
import { History } from 'lucide-react'

export interface BidHistoryProps {
  bids: Bid[]
  currentUserId?: string
}

export const BidHistory: React.FC<BidHistoryProps> = ({ bids, currentUserId }) => {
  return (
    <div className="rounded-xl p-5 border border-slate-200 bg-white flex flex-col h-72">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-1.5 text-slate-700">
          <History className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-semibold uppercase tracking-wider">
            Bid Activity Log
          </h3>
        </div>
        <span className="text-xs text-slate-500">
          {bids.length} bids placed
        </span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1 mt-1">
        {bids.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs">
            No bids placed on this lot yet.
          </div>
        ) : (
          bids.map((bid, index) => {
            const isMe = currentUserId === bid.bidderId
            const isLeading = index === 0

            return (
              <div
                key={bid.id}
                className={`py-2.5 flex items-center justify-between text-xs ${
                  isLeading ? 'bg-amber-50/60 -mx-1.5 px-1.5 rounded' : ''
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-900">
                    {bid.bidderName}
                  </span>
                  {isMe && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      YOU
                    </span>
                  )}
                  {isLeading && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                      HIGH BID
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-right">
                  <span className="text-[11px] text-slate-400">
                    {new Date(bid.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                  <span
                    className={`font-semibold ${
                      isLeading ? 'text-slate-900 font-bold' : 'text-slate-700'
                    }`}
                  >
                    ${bid.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
