-- Live Auction Platform Database Schema for PostgreSQL & pgAdmin
-- Orchid ORM Table Definitions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'BIDDER' NOT NULL,
  balance NUMERIC(12, 2) DEFAULT 10000.0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Auctions Table
CREATE TABLE IF NOT EXISTS auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(1024),
  starting_price NUMERIC(12, 2) NOT NULL,
  reserve_price NUMERIC(12, 2) NOT NULL,
  min_increment NUMERIC(12, 2) NOT NULL,
  current_price NUMERIC(12, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'DRAFT' NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  original_end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  extensions_count INTEGER DEFAULT 0 NOT NULL,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  winner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Bids Table (Immutable Audit Trail)
CREATE TABLE IF NOT EXISTS bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE NOT NULL,
  bidder_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  bidder_name VARCHAR(255) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  is_accepted BOOLEAN DEFAULT TRUE NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for High Contention Queries
CREATE INDEX IF NOT EXISTS idx_bids_auction_created ON bids(auction_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auctions_status_timing ON auctions(status, start_time, end_time);
