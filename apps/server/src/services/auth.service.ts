import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { config } from '../config'
import { repository } from '../db/db'
import type { User, UserSummary, Role } from '../types'

export class AuthService {
  static async register(
    email: string,
    password: string,
    name: string,
    role: Role = 'BIDDER'
  ): Promise<{ token: string; user: UserSummary }> {
    const existing = await repository.findUserByEmail(email)
    if (existing) {
      throw new Error('User already exists with this email address')
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name,
      passwordHash,
      role,
      balance: role === 'BIDDER' ? 10000 : 0,
      createdAt: new Date().toISOString(),
    }

    await repository.createUser(newUser)

    const token = this.generateToken(newUser)
    return {
      token,
      user: this.toSummary(newUser),
    }
  }

  static async login(
    email: string,
    password: string
  ): Promise<{ token: string; user: UserSummary }> {
    const user = await repository.findUserByEmail(email)
    if (!user) {
      throw new Error('Invalid email or password')
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      throw new Error('Invalid email or password')
    }

    const token = this.generateToken(user)
    return {
      token,
      user: this.toSummary(user),
    }
  }

  static generateToken(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    )
  }

  static toSummary(user: User): UserSummary {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      balance: user.balance,
    }
  }
}
