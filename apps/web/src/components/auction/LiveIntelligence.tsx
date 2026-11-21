'use client'

import React from 'react'
import type { AuctionIntelligence } from '@/types'
import { Eye, Users, Gauge, ShieldCheck } from 'lucide-react'

export interface LiveIntelligenceProps {
  intelligence: AuctionIntelligence
}

export const LiveIntelligence: React.FC<LiveIntelligenceProps> = ({ intelligence }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-white rounded-lg p-3.5 border border-slate-200 flex items-center space-x-3 shadow-sm">
        <div className="p-2 rounded-md bg-slate-100 text-slate-600">
          <Eye className="w-4 h-4" />
        </div>
        <div>
          <span className="text-xs text-slate-500 font-medium block">
            Watching Now
          </span>
          <span className="text-base font-bold text-slate-900">
            {intelligence.activeViewers}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg p-3.5 border border-slate-200 flex items-center space-x-3 shadow-sm">
        <div className="p-2 rounded-md bg-slate-100 text-slate-600">
          <Users className="w-4 h-4" />
        </div>
        <div>
          <span className="text-xs text-slate-500 font-medium block">
            Active Bidders
          </span>
          <span className="text-base font-bold text-slate-900">
            {intelligence.activeBidders}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg p-3.5 border border-slate-200 flex items-center space-x-3 shadow-sm">
        <div className="p-2 rounded-md bg-slate-100 text-slate-600">
          <Gauge className="w-4 h-4" />
        </div>
        <div>
          <span className="text-xs text-slate-500 font-medium block">
            Bids / Min
          </span>
          <span className="text-base font-bold text-slate-900">
            {intelligence.bidsPerMinute}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg p-3.5 border border-slate-200 flex items-center space-x-3 shadow-sm">
        <div className="p-2 rounded-md bg-emerald-50 text-emerald-600">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <span className="text-xs text-slate-500 font-medium block">
            Winner Guarantee
          </span>
          <span className="text-xs font-semibold text-emerald-700">
            Exact 1 Winner
          </span>
        </div>
      </div>
    </div>
  )
}
