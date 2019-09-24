import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'

import CONFIG from '../config/config'
import { AuthenticationError } from '../error';
import User from '../models/user';

export default {
  // Sign JWT token
  createAccessToken: asyncHandler(async (user) => {
    const payload = {
      id: user._id,
      name: user.name
    }

    const options = { expiresIn: '3h' }
    const token = await jwt.sign(payload, CONFIG.jwt_secret, options)
    return token
  }),

  // Verify JWT token
  verifyAccessToken: asyncHandler(async (token) => {
    const payload = await jwt.verify(token, CONFIG.jwt_secret)
    return payload
  }),

  getUserData: asyncHandler(async (id) => {
    const user = await User.findOne({ _id: id })
    
    const payload = {
      id: user._id,
      name: user.name
    }
    return payload
  }),

  getExpiry: (token) => {
    if (!jwt.decode(token)) {
      throw (new AuthenticationError('Invaild token'))
    }
    return jwt.decode(token).exp
  }
}