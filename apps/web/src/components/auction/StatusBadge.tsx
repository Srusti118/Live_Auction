'use client'

import React from 'react'
import type { AuctionStatus } from '@/types'

export interface StatusBadgeProps {
  status: AuctionStatus
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'LIVE':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold font-mono tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <span className="w-2 h-2 mr-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          LIVE NOW
        </span>
      )
    case 'SCHEDULED':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold font-mono tracking-wider bg-sky-500/15 text-sky-400 border border-sky-500/30">
          UPCOMING
        </span>
      )
    case 'SOLD':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold font-mono tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
          LOT SOLD
        </span>
      )
    case 'UNSOLD':
    case 'ENDED':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium font-mono text-slate-400 bg-slate-800 border border-slate-700">
          CLOSED
        </span>
      )
    case 'DRAFT':
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium font-mono text-slate-400 bg-slate-800">
          DRAFT
        </span>
      )
  }
}
