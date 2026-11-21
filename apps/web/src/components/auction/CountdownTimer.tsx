'use client'

import React, { useState, useEffect } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'

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
          ? 'bg-amber-50/80 border-amber-300'
          : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-1.5 text-slate-500 text-xs font-medium">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>Time Remaining</span>
        </div>

        {extensionsCount > 0 && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
            Extended {extensionsCount}x (+{extensionsCount * 30}s)
          </span>
        )}
      </div>

      {/* Main Countdown Digits */}
      <div className="py-4 text-center">
        {isClosed ? (
          <div className="text-xl font-bold text-slate-600 uppercase tracking-wide">
            {status === 'SOLD' ? 'Auction Closed — Sold' : 'Auction Concluded'}
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-3 text-slate-900 font-bold">
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-400 font-normal mt-0.5">Hours</span>
            </div>
            <span className="text-2xl text-slate-300 -mt-3">:</span>
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-400 font-normal mt-0.5">Minutes</span>
            </div>
            <span className="text-2xl text-slate-300 -mt-3">:</span>
            <div className="flex flex-col items-center">
              <span
                className={`text-3xl sm:text-4xl ${
                  isEndingSoon ? 'text-amber-600 animate-pulse' : 'text-slate-900'
                }`}
              >
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-400 font-normal mt-0.5">Seconds</span>
            </div>
          </div>
        )}
      </div>

      {/* Anti-Sniping Alert Banner */}
      {isEndingSoon && (
        <div className="mt-2 p-2.5 rounded-lg bg-amber-100 border border-amber-200 flex items-start space-x-2 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Anti-Sniping Active:</strong> A late bid arrived in the last 30s. The clock automatically extends by 30 seconds for every new bid.
          </span>
        </div>
      )}

      {lastExtensionNotice && (
        <div className="mt-2 p-2 rounded-lg bg-slate-900 text-white font-medium text-center text-xs">
          {lastExtensionNotice}
        </div>
      )}
    </div>
  )
}
