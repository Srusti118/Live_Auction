'use client'

import React from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { TrendingUp } from 'lucide-react'

export interface PriceMovementGraphProps {
  data: Array<{
    timestamp: string
    price: number
    bidderName: string
  }>
}

export const PriceMovementGraph: React.FC<PriceMovementGraphProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl p-6 border border-slate-800 bg-slate-900 h-64 flex flex-col justify-center items-center text-slate-500 text-xs font-mono">
        <TrendingUp className="w-6 h-6 text-slate-700 mb-2" />
        No price movements recorded yet
      </div>
    )
  }

  const chartData = data.map((d) => ({
    time: new Date(d.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    price: d.price,
    bidder: d.bidderName,
  }))

  return (
    <div className="rounded-xl p-5 border border-slate-800 bg-slate-900 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-2 text-slate-300">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold font-mono tracking-wider uppercase">
            Price Progression Curve
          </h3>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">Tick Ticker</span>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(v) => `$${v}`}
              domain={['auto', 'auto']}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload
                  return (
                    <div className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 shadow-xl text-xs font-mono">
                      <div className="text-amber-400 font-bold">${item.price.toLocaleString()}</div>
                      <div className="text-slate-300 text-[11px] mt-0.5">{item.bidder}</div>
                      <div className="text-slate-500 text-[10px]">{item.time}</div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: '#f59e0b', r: 2.5 }}
              activeDot={{ r: 5, fill: '#10b981' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
