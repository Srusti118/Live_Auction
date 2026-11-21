'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Gavel, Wallet, UserCircle, Plus, ChevronDown } from 'lucide-react'

export interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = () => {
  const { user, switchDemoUser } = useAuth()

  return (
    <nav className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 shadow-md">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white flex items-center space-x-1.5">
                <span>HERITAGE</span>
                <span className="text-amber-400 font-light">&</span>
                <span>CO.</span>
              </span>
              <span className="block text-[10px] text-slate-400 tracking-wider uppercase font-mono">
                Live Fine Art & Collectibles
              </span>
            </div>
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex items-center space-x-6 text-xs font-medium text-slate-300">
            <Link href="/" className="hover:text-amber-400 transition-colors">
              Live Catalogue
            </Link>
            <Link href="/auctions/create" className="hover:text-amber-400 transition-colors flex items-center space-x-1">
              <Plus className="w-3.5 h-3.5" />
              <span>Consign Item</span>
            </Link>
          </div>

          {/* Right Actions: Demo Switcher + Wallet */}
          <div className="flex items-center space-x-3">
            {/* Quick Demo Bidder Switcher */}
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              <span className="text-slate-500 px-2 text-[11px] hidden sm:inline">Active Bidder:</span>
              <button
                onClick={() => void switchDemoUser('alice@bidder.com')}
                className={`px-2.5 py-1 rounded text-xs transition ${
                  user?.email === 'alice@bidder.com'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Alice ($45k)
              </button>
              <button
                onClick={() => void switchDemoUser('bob@bidder.com')}
                className={`px-2.5 py-1 rounded text-xs transition ${
                  user?.email === 'bob@bidder.com'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Bob ($60k)
              </button>
              <button
                onClick={() => void switchDemoUser('admin@auction.com')}
                className={`px-2.5 py-1 rounded text-xs transition hidden lg:inline ${
                  user?.email === 'admin@auction.com'
                    ? 'bg-purple-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Auctioneer
              </button>
            </div>

            {/* Wallet Display */}
            {user && (
              <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/80 text-xs font-mono">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold text-emerald-400">
                  ${user.balance.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
