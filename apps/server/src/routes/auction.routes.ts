import { Router } from 'express'
import { AuctionController } from '../controllers/auction.controller'
import { authenticateJwt } from '../middleware/auth.middleware'

export const auctionRouter = Router()

auctionRouter.get('/', (req, res) => {
  void AuctionController.list(req, res)
})

auctionRouter.get('/:id', (req, res) => {
  void AuctionController.getById(req, res)
})

auctionRouter.post('/', authenticateJwt, (req, res) => {
  void AuctionController.create(req, res)
})

auctionRouter.post('/:id/bid', authenticateJwt, (req, res) => {
  void AuctionController.placeBid(req, res)
})
