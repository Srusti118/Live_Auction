import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'
import { authenticateJwt } from '../middleware/auth.middleware'

export const authRouter = Router()

authRouter.post('/register', (req, res) => {
  void AuthController.register(req, res)
})

authRouter.post('/login', (req, res) => {
  void AuthController.login(req, res)
})

authRouter.get('/me', authenticateJwt, (req, res) => {
  void AuthController.me(req, res)
})
