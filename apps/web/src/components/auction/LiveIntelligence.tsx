'use client'

import React from 'react'
import type { AuctionIntelligence } from '@/types'
import { Eye, Users, Gauge, CheckCircle2 } from 'lucide-react'

export interface LiveIntelligenceProps {
  intelligence: AuctionIntelligence
}

export const LiveIntelligence: React.FC<LiveIntelligenceProps> = ({ intelligence }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-slate-900 rounded-lg p-3.5 border border-slate-800 flex items-center space-x-3">
        <div className="p-2 rounded bg-slate-800 text-slate-300">
          <Eye className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
            Watching
          </span>
          <span className="text-base font-bold text-white font-mono">
            {intelligence.activeViewers}
          </span>
        </div>
      </div>

      <div className="bg-slate-900 rounded-lg p-3.5 border border-slate-800 flex items-center space-x-3">
        <div className="p-2 rounded bg-slate-800 text-slate-300">
          <Users className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
            Active Bidders
          </span>
          <span className="text-base font-bold text-white font-mono">
            {intelligence.activeBidders}
          </span>
        </div>
      </div>

      <div className="bg-slate-900 rounded-lg p-3.5 border border-slate-800 flex items-center space-x-3">
        <div className="p-2 rounded bg-slate-800 text-amber-400">
          <Gauge className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
            Bid Velocity
          </span>
          <span className="text-base font-bold text-white font-mono">
            {intelligence.bidsPerMinute}{' '}
            <span className="text-xs text-slate-500 font-sans">bids/min</span>
          </span>
        </div>
      </div>

      <div className="bg-slate-900 rounded-lg p-3.5 border border-slate-800 flex items-center space-x-3">
        <div className="p-2 rounded bg-slate-800 text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
            Engine State
          </span>
          <span className="text-xs font-bold text-emerald-400 font-mono tracking-wide">
            Sub-ms Atomic
          </span>
        </div>
      </div>
    </div>
  )
}
