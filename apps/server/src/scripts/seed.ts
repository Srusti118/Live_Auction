import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { repository } from '../db/db'
import { logger } from '../utils/logger'
import type { User, Auction, Bid } from '../types'

export async function runSeed(): Promise<void> {
  await repository.init()
  logger.info('Starting database seeding...')

  const passwordHash = await bcrypt.hash('password123', 10)

  // 1. Realistic Collector Profiles
  const admin: User = {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'phillips@auctioneer.com',
    name: 'Arthur Phillips',
    passwordHash,
    role: 'ADMIN',
    balance: 1000000,
    createdAt: new Date().toISOString(),
  }

  const james: User = {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'james@collector.com',
    name: 'James Henderson',
    passwordHash,
    role: 'BIDDER',
    balance: 75000,
    createdAt: new Date().toISOString(),
  }

  const sarah: User = {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'sarah@collector.com',
    name: 'Sarah Jenkins',
    passwordHash,
    role: 'BIDDER',
    balance: 120000,
    createdAt: new Date().toISOString(),
  }

  const michael: User = {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'michael@collector.com',
    name: 'Michael Chang',
    passwordHash,
    role: 'BIDDER',
    balance: 50000,
    createdAt: new Date().toISOString(),
  }

  await repository.createUser(admin)
  await repository.createUser(james)
  await repository.createUser(sarah)
  await repository.createUser(michael)

  // 2. Create Auctions
  const now = Date.now()

  // Auction 1: Ending in 50 seconds (Great for verifying anti-sniping soft-close)
  const auction1End = new Date(now + 50 * 1000).toISOString()
  const auction1: Auction = {
    id: 'a1111111-1111-1111-1111-111111111111',
    title: '1968 Rolex Submariner Ref. 5513 "Meter First"',
    description:
      'Untouched matte dial with creamy tritium patina, sharp original case bevels, and verified matching riveted bracelet. Accompanied by service papers.',
    imageUrl:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1000',
    startingPrice: 8500,
    reservePrice: 10000,
    minIncrement: 250,
    currentPrice: 9500,
    status: 'LIVE',
    startTime: new Date(now - 10 * 60 * 1000).toISOString(),
    endTime: auction1End,
    originalEndTime: auction1End,
    extensionsCount: 0,
    sellerId: admin.id,
    winnerId: james.id,
    createdAt: new Date(now - 10 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }

  // Initial bids for Auction 1
  const bid1: Bid = {
    id: crypto.randomUUID(),
    auctionId: auction1.id,
    bidderId: sarah.id,
    bidderName: sarah.name,
    amount: 8750,
    isAccepted: true,
    reason: null,
    createdAt: new Date(now - 8 * 60 * 1000).toISOString(),
  }

  const bid2: Bid = {
    id: crypto.randomUUID(),
    auctionId: auction1.id,
    bidderId: james.id,
    bidderName: james.name,
    amount: 9500,
    isAccepted: true,
    reason: null,
    createdAt: new Date(now - 2 * 60 * 1000).toISOString(),
  }

  // Auction 2: Live (Ending in 12 minutes)
  const auction2End = new Date(now + 12 * 60 * 1000).toISOString()
  const auction2: Auction = {
    id: 'a2222222-2222-2222-2222-222222222222',
    title: 'Patek Philippe Nautilus 5711/1A-010 Stainless Steel',
    description:
      'Gérald Genta classic with horizontally embossed black-blue gradient dial, sapphire caseback, and integrated bracelet. Complete with original certificate.',
    imageUrl:
      'https://images.unsplash.com/photo-1547996160-71dfabb19283?auto=format&fit=crop&q=80&w=1000',
    startingPrice: 35000,
    reservePrice: 42000,
    minIncrement: 1000,
    currentPrice: 38000,
    status: 'LIVE',
    startTime: new Date(now - 5 * 60 * 1000).toISOString(),
    endTime: auction2End,
    originalEndTime: auction2End,
    extensionsCount: 0,
    sellerId: admin.id,
    winnerId: michael.id,
    createdAt: new Date(now - 5 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const bid3: Bid = {
    id: crypto.randomUUID(),
    auctionId: auction2.id,
    bidderId: michael.id,
    bidderName: michael.name,
    amount: 38000,
    isAccepted: true,
    reason: null,
    createdAt: new Date(now - 3 * 60 * 1000).toISOString(),
  }

  // Auction 3: Scheduled
  const auction3Start = new Date(now + 30 * 60 * 1000).toISOString()
  const auction3End = new Date(now + 90 * 60 * 1000).toISOString()
  const auction3: Auction = {
    id: 'a3333333-3333-3333-3333-333333333333',
    title: '1965 Shelby GT350 Competition "R-Model"',
    description:
      'One of only 34 competition R-models produced. Authentic race pedigree, original chassis plate, and fully documented competition history.',
    imageUrl:
      'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&q=80&w=1000',
    startingPrice: 150000,
    reservePrice: 200000,
    minIncrement: 5000,
    currentPrice: 0,
    status: 'SCHEDULED',
    startTime: auction3Start,
    endTime: auction3End,
    originalEndTime: auction3End,
    extensionsCount: 0,
    sellerId: admin.id,
    winnerId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await repository.saveAuction(auction1)
  await repository.saveBid(bid1)
  await repository.saveBid(bid2)

  await repository.saveAuction(auction2)
  await repository.saveBid(bid3)

  await repository.saveAuction(auction3)

  logger.info('Database seeded successfully with authentic collector profiles!')
  logger.info('Collector Accounts:')
  logger.info('  James Henderson:  james@collector.com     / password123 (Balance: $75,000)')
  logger.info('  Sarah Jenkins:    sarah@collector.com     / password123 (Balance: $120,000)')
  logger.info('  Michael Chang:    michael@collector.com   / password123 (Balance: $50,000)')
  logger.info('  Arthur Phillips:  phillips@auctioneer.com / password123 (Auction Specialist)')
}

if (process.argv[1] && process.argv[1].includes('seed')) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error('Seed script failed:', err)
      process.exit(1)
    })
}
