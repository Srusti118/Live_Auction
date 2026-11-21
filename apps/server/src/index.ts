import express from 'express'
import http from 'http'
import cors from 'cors'
import { WebSocketServer } from 'ws'
import { config } from './config'
import { logger } from './utils/logger'
import { repository } from './db/db'
import { authRouter } from './routes/auth.routes'
import { auctionRouter } from './routes/auction.routes'
import { WebSocketService } from './services/websocket.service'
import { LifecycleService } from './services/lifecycle.service'

const app = express()
app.use(cors({ origin: '*' }))
app.use(express.json())

// Health and time check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    serverTime: Date.now(),
    serverIso: new Date().toISOString(),
  })
})

// Routes
app.use('/api/auth', authRouter)
app.use('/api/auctions', auctionRouter)

const server = http.createServer(app)
const wss = new WebSocketServer({ server, path: '/ws' })

async function bootstrap(): Promise<void> {
  await repository.init()
  WebSocketService.initialize(wss)
  LifecycleService.start()

  server.listen(config.port, () => {
    logger.info(`Live Auction Server running on http://localhost:${config.port}`)
    logger.info(`WebSocket endpoint available at ws://localhost:${config.port}/ws`)
  })
}

bootstrap().catch((err) => {
  logger.error('Failed to start server:', err)
  process.exit(1)
})
