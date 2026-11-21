'use client'

import React from 'react'
import type { Bid } from '@/types'
import { History, CheckCircle } from 'lucide-react'

export interface BidHistoryProps {
  bids: Bid[]
  currentUserId?: string
}

export const BidHistory: React.FC<BidHistoryProps> = ({ bids, currentUserId }) => {
  return (
    <div className="rounded-xl p-5 border border-slate-800 bg-slate-900 flex flex-col h-80">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-2 text-slate-300">
          <History className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-bold font-mono tracking-wider uppercase">
            Official Bidding Log
          </h3>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          {bids.length} recorded
        </span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 pr-1 mt-1">
        {bids.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono">
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
                  isLeading ? 'bg-amber-500/10 -mx-1.5 px-1.5 rounded' : ''
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-200">
                    {bid.bidderName}
                  </span>
                  {isMe && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 font-mono">
                      YOU
                    </span>
                  )}
                  {isLeading && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 font-mono">
                      HIGH BID
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-right">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(bid.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      isLeading ? 'text-amber-400' : 'text-slate-300'
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
