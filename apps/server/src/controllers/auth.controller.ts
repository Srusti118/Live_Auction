import type { Request, Response } from 'express'
import { AuthService } from '../services/auth.service'
import { repository } from '../db/db'
import type { AuthenticatedRequest } from '../middleware/auth.middleware'

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, role } = req.body
      if (!email || !password || !name) {
        res.status(400).json({ error: 'Email, password and name are required' })
        return
      }

      const result = await AuthService.register(email, password, name, role)
      res.status(201).json(result)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed'
      res.status(400).json({ error: msg })
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' })
        return
      }

      const result = await AuthService.login(email, password)
      res.status(200).json(result)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      res.status(401).json({ error: msg })
    }
  }

  static async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const user = await repository.findUserById(req.user.id)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    res.status(200).json({ user: AuthService.toSummary(user) })
  }
}
