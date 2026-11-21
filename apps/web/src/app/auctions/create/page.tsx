'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ApiClient } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import type { Auction } from '@/types'
import { PlusCircle, ArrowLeft, Image, DollarSign, Clock } from 'lucide-react'

export default function CreateAuctionPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=1000'
  )
  const [startingPrice, setStartingPrice] = useState('1000')
  const [reservePrice, setReservePrice] = useState('1500')
  const [minIncrement, setMinIncrement] = useState('100')
  const [durationMinutes, setDurationMinutes] = useState('10')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await ApiClient.post<{ auction: Auction }>('/auctions', {
        title,
        description,
        imageUrl,
        startingPrice: Number(startingPrice),
        reservePrice: Number(reservePrice),
        minIncrement: Number(minIncrement),
        durationMinutes: Number(durationMinutes),
      })

      router.push(`/auctions/${res.auction.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create auction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link
        href="/"
        className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Discovery</span>
      </Link>

      <div className="bg-slate-900/90 rounded-3xl p-8 border border-slate-800 shadow-2xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Create New Live Auction</h1>
            <p className="text-xs text-slate-400">
              List an item with reserve price and automated anti-sniping protection
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Auction Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 1974 Porsche 911 Carrera 2.7 RS"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Description
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed provenance, condition report, and certificates..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Image URL
            </label>
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Starting Price ($)
              </label>
              <input
                type="number"
                min="1"
                required
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Reserve Price ($)
              </label>
              <input
                type="number"
                min="1"
                required
                value={reservePrice}
                onChange={(e) => setReservePrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Min Bid Increment ($)
              </label>
              <input
                type="number"
                min="1"
                required
                value={minIncrement}
                onChange={(e) => setMinIncrement(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min="1"
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            {loading ? 'Creating Auction...' : 'Publish Live Auction'}
          </button>
        </form>
      </div>
    </div>
  )
}
