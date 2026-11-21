import dotenv from 'dotenv'

dotenv.config()

export const config = {
  port: Number(process.env.PORT) || 4000,
  jwtSecret: process.env.JWT_SECRET || 'live-auction-super-secret-key-2026',
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/live_auction?sslmode=disable',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  antiSnipingThresholdSeconds: 30,
  antiSnipingExtensionSeconds: 30,
}
