'use client'

import React, { useState } from 'react'
import type { Auction } from '@/types'
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'

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
      setErrorMsg(`Insufficient funds. Your wallet balance is $${userBalance.toLocaleString()}`)
      return
    }
    onPlaceBid(amount)
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    const amount = Number(customBid)

    if (isNaN(amount) || amount < nextMinBid) {
      setErrorMsg(`Bid must be at least $${nextMinBid.toLocaleString()}`)
      return
    }

    if (amount > userBalance) {
      setErrorMsg(`Insufficient funds. Your wallet balance is $${userBalance.toLocaleString()}`)
      return
    }

    onPlaceBid(amount)
  }

  const isLive = auction.status === 'LIVE'

  return (
    <div className="rounded-xl p-5 border border-slate-200 bg-white space-y-5">
      {/* Current Price & Reserve Status */}
      <div className="flex items-start justify-between pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs text-slate-500 font-medium block">
            Current Highest Bid
          </span>
          <div className="text-3xl font-extrabold text-slate-900 mt-0.5">
            ${currentPrice.toLocaleString()}
          </div>
          <div className="mt-1">
            {reserveMet ? (
              <span className="text-xs font-semibold text-emerald-700">
                ✓ Reserve Price Met
              </span>
            ) : (
              <span className="text-xs text-slate-500">
                Reserve not yet met (${auction.reservePrice.toLocaleString()})
              </span>
            )}
          </div>
        </div>

        {/* Current User Status */}
        <div>
          {isWinning ? (
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>You are winning</span>
            </div>
          ) : auction.currentPrice > 0 ? (
            <div className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 text-xs font-medium border border-slate-200">
              Not leading
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-500 text-xs font-medium border border-slate-200">
              No bids yet
            </div>
          )}
        </div>
      </div>

      {/* Calculated One-Click Bidding Buttons */}
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-2">
          One-Click Quick Bid
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
                className="py-2.5 px-3 rounded-lg bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-900 font-semibold text-xs border border-slate-200 transition flex flex-col items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="text-sm font-bold">${targetAmount.toLocaleString()}</span>
                <span className="text-[11px] font-normal opacity-70">
                  (+${inc.toLocaleString()})
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Custom Bid Form */}
      <form onSubmit={handleCustomSubmit} className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex justify-between items-center text-xs">
          <label className="font-semibold text-slate-700">Custom Bid Amount</label>
          <span className="text-slate-500 text-[11px]">
            Min: ${nextMinBid.toLocaleString()}
          </span>
        </div>
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
              $
            </span>
            <input
              type="number"
              step="any"
              min={nextMinBid}
              value={customBid}
              onChange={(e) => setCustomBid(e.target.value)}
              disabled={!isLive || isWinning || !isConnected}
              className="w-full bg-white border border-slate-300 rounded-lg py-2 pl-7 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              placeholder={`Min ${nextMinBid}`}
            />
          </div>
          <button
            type="submit"
            disabled={!isLive || isWinning || !isConnected}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            <span>Place Bid</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-center space-x-1.5 text-xs text-rose-600 pt-1">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </form>
    </div>
  )
}
