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
      <div className="rounded-xl p-6 border border-slate-200 bg-white h-56 flex flex-col justify-center items-center text-slate-400 text-xs">
        <TrendingUp className="w-6 h-6 text-slate-300 mb-2" />
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
    <div className="rounded-xl p-5 border border-slate-200 bg-white space-y-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2 text-slate-800">
          <TrendingUp className="w-4 h-4 text-slate-600" />
          <h3 className="text-xs font-semibold uppercase tracking-wider">
            Price History & Progression
          </h3>
        </div>
        <span className="text-xs text-slate-400">Live timeline</span>
      </div>

      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="time"
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tickFormatter={(v) => `$${v}`}
              domain={['auto', 'auto']}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload
                  return (
                    <div className="bg-slate-900 text-white rounded-lg p-2.5 shadow-md text-xs">
                      <div className="font-bold">${item.price.toLocaleString()}</div>
                      <div className="text-slate-300 text-[11px] mt-0.5">{item.bidder}</div>
                      <div className="text-slate-400 text-[10px]">{item.time}</div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#0f172a"
              strokeWidth={2}
              dot={{ fill: '#0f172a', r: 2.5 }}
              activeDot={{ r: 5, fill: '#2563eb' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
