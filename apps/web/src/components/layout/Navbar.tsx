'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Gavel, Wallet, Plus, ChevronDown, Check, UserCheck, X } from 'lucide-react'

export interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = () => {
  const { user, switchDemoUser, updateBalance, depositFunds, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [budgetModalOpen, setBudgetModalOpen] = useState(false)
  const [customBudgetInput, setCustomBudgetInput] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const collectors = [
    { name: 'James Henderson', email: 'james@collector.com', role: 'Private Collector', tier: '$75k base' },
    { name: 'Sarah Jenkins', email: 'sarah@collector.com', role: 'Art & Antiquities Collector', tier: '$120k base' },
    { name: 'Michael Chang', email: 'michael@collector.com', role: 'Horology Enthusiast', tier: '$50k base' },
    { name: 'Arthur Phillips', email: 'phillips@auctioneer.com', role: 'Auction Specialist (Admin)', tier: 'Catalog Host' },
  ]

  const handleDeposit = async (amount: number) => {
    await depositFunds(amount)
    setBudgetModalOpen(false)
  }

  const handleSetCustomBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = Number(customBudgetInput)
    if (!isNaN(amount) && amount >= 0) {
      await updateBalance(amount)
      setCustomBudgetInput('')
      setBudgetModalOpen(false)
    }
  }

  return (
    <>
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-md bg-slate-900 flex items-center justify-center text-white">
                <Gavel className="w-4 h-4" />
              </div>
              <div>
                <span className="text-base font-bold text-slate-900 tracking-tight block leading-tight">
                  Heritage Live
                </span>
                <span className="text-[11px] text-slate-500 font-normal">
                  Online Auction Platform
                </span>
              </div>
            </Link>

            {/* Center Navigation */}
            <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
              <Link href="/" className="hover:text-slate-900 transition-colors">
                Current Auctions
              </Link>
              <Link
                href="/auctions/create"
                className="hover:text-slate-900 transition-colors flex items-center space-x-1"
              >
                <Plus className="w-4 h-4 text-slate-500" />
                <span>Submit an Item</span>
              </Link>
            </div>

            {/* Right Area: Budget & User Profile */}
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  {/* Wallet Budget with "Add Funds" button */}
                  <div className="flex items-center space-x-1.5 bg-slate-50 pl-3 pr-1.5 py-1 rounded-lg border border-slate-200 text-xs">
                    <Wallet className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-bold text-slate-900">
                      ${user.balance.toLocaleString()}
                    </span>
                    <button
                      onClick={() => setBudgetModalOpen(true)}
                      className="ml-1 px-2 py-0.5 rounded bg-white hover:bg-slate-200 text-slate-700 font-medium text-[11px] border border-slate-300 transition shadow-xs"
                      title="Adjust or add budget funds"
                    >
                      + Budget
                    </button>
                  </div>

                  {/* User Profile Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 transition text-left"
                    >
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                        {user.name.charAt(0)}
                      </div>
                      <div className="hidden sm:block text-left">
                        <span className="text-xs font-semibold text-slate-900 block leading-tight">
                          {user.name}
                        </span>
                        <span className="text-[10px] text-slate-500 block leading-none">
                          {user.role === 'ADMIN' ? 'Auction Specialist' : 'Verified Collector'}
                        </span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="px-4 py-2 border-b border-slate-100">
                          <p className="text-xs font-bold text-slate-900">{user.name}</p>
                          <p className="text-[11px] text-slate-500">{user.email}</p>
                          <div className="mt-2 flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span className="text-slate-500">Available Budget:</span>
                            <span className="font-bold text-slate-900">${user.balance.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Switch Collector Account */}
                        <div className="px-3 py-2">
                          <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider px-1 mb-1">
                            Switch Collector Identity
                          </p>
                          <div className="space-y-1">
                            {collectors.map((c) => {
                              const isCurrent = user.email === c.email
                              return (
                                <button
                                  key={c.email}
                                  onClick={() => {
                                    void switchDemoUser(c.email)
                                    setDropdownOpen(false)
                                  }}
                                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                                    isCurrent
                                      ? 'bg-slate-100 font-semibold text-slate-900'
                                      : 'hover:bg-slate-50 text-slate-700'
                                  }`}
                                >
                                  <div>
                                    <span className="block">{c.name}</span>
                                    <span className="text-[10px] text-slate-400">{c.role}</span>
                                  </div>
                                  {isCurrent && <Check className="w-3.5 h-3.5 text-slate-900" />}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        <div className="border-t border-slate-100 pt-1 px-3">
                          <button
                            onClick={() => {
                              setDropdownOpen(false)
                              setBudgetModalOpen(true)
                            }}
                            className="w-full text-left px-2.5 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            Deposit / Set Exact Budget
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2 text-xs">
                  <Link
                    href="/login"
                    className="px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-700 font-medium transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium transition"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Adjust Budget Modal */}
      {budgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Manage Bidding Budget</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Current Balance: <strong className="text-slate-900">${user?.balance.toLocaleString()}</strong>
                </p>
              </div>
              <button
                onClick={() => setBudgetModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Add Funds Buttons */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Quick Add Funds
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[10000, 25000, 50000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => handleDeposit(amt)}
                    className="py-2 px-2.5 rounded-lg bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 text-slate-800 font-semibold text-xs transition"
                  >
                    +${(amt / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>

            {/* Set Specific Total Budget */}
            <form onSubmit={handleSetCustomBudget} className="space-y-3 pt-3 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700 block">
                Or Set Exact Budget Amount ($)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  min="0"
                  step="1000"
                  required
                  placeholder="e.g. 150000"
                  value={customBudgetInput}
                  onChange={(e) => setCustomBudgetInput(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition"
                >
                  Set
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
