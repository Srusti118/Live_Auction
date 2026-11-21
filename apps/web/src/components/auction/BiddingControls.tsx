'use client'

import React, { useState } from 'react'
import type { Auction } from '@/types'
import { CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react'

export interface BiddingControlsProps {
  auction: Auction
  isWinning: boolean
  userBalance: number
  onPlaceBid: (amount: number) => void
  isConnected: boolean
}

export const BiddingControls: React.FC<BiddingControlsProps> = ({
  auction,
  isWinning,
  userBalance,
  onPlaceBid,
  isConnected,
}) => {
  const currentPrice = auction.currentPrice || auction.startingPrice
  const minIncrement = auction.minIncrement
  const nextMinBid =
    auction.currentPrice === 0
      ? auction.startingPrice
      : auction.currentPrice + minIncrement

  const [customBid, setCustomBid] = useState<string>(String(nextMinBid))
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const reserveMet = auction.currentPrice >= auction.reservePrice

  const handlePlaceBidAmount = (amount: number) => {
    setErrorMsg(null)
    if (amount > userBalance) {
      setErrorMsg(`Insufficient funds! Your balance is $${userBalance.toLocaleString()}`)
      return
    }
    onPlaceBid(amount)
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    const amount = Number(customBid)

    if (isNaN(amount) || amount < nextMinBid) {
      setErrorMsg(`Minimum valid bid is $${nextMinBid.toLocaleString()}`)
      return
    }

    if (amount > userBalance) {
      setErrorMsg(`Insufficient funds! Your balance is $${userBalance.toLocaleString()}`)
      return
    }

    onPlaceBid(amount)
  }

  const isLive = auction.status === 'LIVE'

  return (
    <div className="rounded-xl p-5 border border-slate-800 bg-slate-900 space-y-5">
      {/* Current Price & Status Header */}
      <div className="flex items-start justify-between pb-4 border-b border-slate-800/80">
        <div>
          <span className="text-[11px] font-mono uppercase text-slate-400 block tracking-wider">
            Current High Bid
          </span>
          <div className="text-3xl font-extrabold text-white font-mono mt-0.5">
            ${currentPrice.toLocaleString()}
          </div>
          <div className="mt-1">
            {reserveMet ? (
              <span className="inline-flex items-center text-[10px] font-bold font-mono text-emerald-400 uppercase tracking-wide">
                ✓ Reserve Price Met
              </span>
            ) : (
              <span className="inline-flex items-center text-[10px] font-bold font-mono text-amber-400 uppercase tracking-wide">
                • Reserve not yet met (${auction.reservePrice.toLocaleString()})
              </span>
            )}
          </div>
        </div>

        {/* User Standing Status Badge */}
        <div>
          {isWinning ? (
            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>You are winning</span>
            </div>
          ) : auction.currentPrice > 0 ? (
            <div className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-medium border border-slate-700">
              Outbid / Not Leading
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-medium">
              No Bids Yet
            </div>
          )}
        </div>
      </div>

      {/* Quick Bidding with Exact Computed Prices */}
      <div>
        <label className="text-xs font-medium text-slate-300 block mb-2">
          One-Click Instant Bids (Calculated with Increment)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[minIncrement, minIncrement * 2, minIncrement * 5].map((inc) => {
            const targetAmount =
              auction.currentPrice === 0
                ? auction.startingPrice + (inc - minIncrement)
                : auction.currentPrice + inc

            return (
              <button
                key={inc}
                disabled={!isLive || isWinning || !isConnected}
                onClick={() => handlePlaceBidAmount(targetAmount)}
                className="py-3 px-3 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white font-mono font-bold text-xs border border-slate-700 hover:border-amber-400 transition flex flex-col items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                <span className="text-sm">${targetAmount.toLocaleString()}</span>
                <span className="text-[10px] font-normal opacity-75 font-sans mt-0.5">
                  (+${inc.toLocaleString()})
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Custom Bid Entry */}
      <form onSubmit={handleCustomSubmit} className="space-y-2 pt-2 border-t border-slate-800/80">
        <div className="flex justify-between items-center text-xs">
          <label className="font-medium text-slate-300">Enter Specific Amount</label>
          <span className="text-slate-500 font-mono text-[11px]">
            Min: ${nextMinBid.toLocaleString()}
          </span>
        </div>
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono font-bold">
              $
            </span>
            <input
              type="number"
              step="any"
              min={nextMinBid}
              value={customBid}
              onChange={(e) => setCustomBid(e.target.value)}
              disabled={!isLive || isWinning || !isConnected}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-7 pr-3 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
              placeholder={`Min ${nextMinBid}`}
            />
          </div>
          <button
            type="submit"
            disabled={!isLive || isWinning || !isConnected}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            <span>Place Bid</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-center space-x-1.5 text-xs text-rose-400 pt-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{errorMsg}</span>
          </div>
        )}
      </form>
    </div>
  )
}
