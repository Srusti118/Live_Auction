'use client'

import React, { useState, useEffect } from 'react'
import { Clock, AlertCircle } from 'lucide-react'

export interface CountdownTimerProps {
  endTime: string
  serverTimeOffset: number
  extensionsCount: number
  status: string
  lastExtensionNotice: string | null
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  endTime,
  serverTimeOffset,
  extensionsCount,
  status,
  lastExtensionNotice,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number
    minutes: number
    seconds: number
    totalMs: number
  }>({ hours: 0, minutes: 0, seconds: 0, totalMs: 0 })

  useEffect(() => {
    const updateCountdown = () => {
      const serverNow = Date.now() + serverTimeOffset
      const endMs = new Date(endTime).getTime()
      const diff = Math.max(0, endMs - serverNow)

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft({ hours, minutes, seconds, totalMs: diff })
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 250)
    return () => clearInterval(timer)
  }, [endTime, serverTimeOffset])

  const isEndingSoon = timeLeft.totalMs > 0 && timeLeft.totalMs <= 30000 && status === 'LIVE'
  const isClosed = timeLeft.totalMs === 0 || status !== 'LIVE'

  return (
    <div
      className={`rounded-xl p-5 border transition-all ${
        isEndingSoon
          ? 'bg-rose-950/30 border-rose-600/80'
          : 'bg-slate-900 border-slate-800'
      }`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-2 text-slate-400">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-mono uppercase tracking-wider">Time Remaining</span>
        </div>

        {extensionsCount > 0 && (
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Extended {extensionsCount}x (+{extensionsCount * 30}s)
          </span>
        )}
      </div>

      {/* Main Countdown Numbers */}
      <div className="py-4 text-center">
        {isClosed ? (
          <div className="text-xl font-bold text-slate-400 uppercase tracking-wider font-mono">
            {status === 'SOLD' ? 'Lot Closed — Sold' : 'Auction Concluded'}
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-3 font-mono">
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-extrabold text-white">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-sans mt-0.5">Hours</span>
            </div>
            <span className="text-2xl text-slate-600 font-bold -mt-3">:</span>
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-extrabold text-white">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-sans mt-0.5">Mins</span>
            </div>
            <span className="text-2xl text-slate-600 font-bold -mt-3">:</span>
            <div className="flex flex-col items-center">
              <span
                className={`text-3xl sm:text-4xl font-extrabold ${
                  isEndingSoon ? 'text-rose-400 animate-pulse' : 'text-white'
                }`}
              >
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-sans mt-0.5">Secs</span>
            </div>
          </div>
        )}
      </div>

      {/* Clear Anti-Sniping Alert */}
      {isEndingSoon && (
        <div className="mt-2 p-2.5 rounded-lg bg-rose-900/40 border border-rose-700/60 flex items-center space-x-2 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>
            <strong>Anti-Sniping Active:</strong> Any bid placed now extends the auction by 30 seconds.
          </span>
        </div>
      )}

      {lastExtensionNotice && (
        <div className="mt-2 p-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-center text-xs uppercase tracking-wide">
          ⚡ {lastExtensionNotice}
        </div>
      )}
    </div>
  )
}
