import asyncHandler from 'express-async-handler'

import User from '../models/user'
import tokenHelper from '../utils/token'
import { BadRequestError, AuthenticationError } from '../error'

export default {
  // Handle signup by POST
  signup: asyncHandler(async (req, res, next) => {
    const { name, hkid, email, password } = req.body
    if ( !name || !hkid || !email || !password ) {
      return next(new BadRequestError('Name, HKID, Email and Password are required'))
    }

    const createdUser = await User.create(req.body)

    const userData = {
      'name': createdUser.name,
      'id': createdUser._id
    }

    // Create JWT access token and refresh token
    const accessToken = await tokenHelper.createAccessToken(createdUser)
    const expiredAt = await tokenHelper.getExpiry(accessToken)
    const refreshToken = await tokenHelper.createRefreshToken(createdUser)

    res.formatSend({
      'result': 'created',
      userData,
      accessToken,
      refreshToken,
      expiredAt
    }, 201)
  }),

  // Handle signin by POST
  signin: asyncHandler(async (req, res, next) => {
    const { email, password} = req.body
    if ( !email || !password ) {
      return next(new BadRequestError('Name, Password are required'))
    }
    
    // Verify user email and password
    const user = await User.authenticate(email, password)
    if (!user) {
      return next(new BadRequestError('Invaild email or password'))
    }

    const userData = {
      'name': user.name,
      'id': user._id
    }

    // Create JWT access token and refresh token
    const accessToken = await tokenHelper.createAccessToken(user)
    const expiredAt = await tokenHelper.getExpiry(accessToken)
    const refreshToken = await tokenHelper.createRefreshToken(user)

    res.formatSend({
      userData,
      accessToken,
      refreshToken,
      expiredAt
    })
  }),

  refreshToken: asyncHandler(async (req, res, next) => {
    const { refreshToken } = req.body
    if (!refreshToken) {
      return next(new BadRequestError('Refresh token is required'))
    }

    // Verify refresh token
    const payload = await tokenHelper.verifyAccessToken(refreshToken)
    const user = await User.findOne({'_id': payload.id})
    if (!user) {
      return next(new AuthenticationError('Invaild refresh token'))
    }

    // Create new JWT access token and refresh token
    const accessToken = await tokenHelper.createAccessToken(user)
    const expiredAt = await tokenHelper.getExpiry(accessToken)
    const newRefreshToken = await tokenHelper.createRefreshToken(user)
    
    res.formatSend({
      accessToken,
      refreshToken: newRefreshToken,
      expiredAt
    })
  }),

  // Return user info by validate access token
  access: asyncHandler(async (req, res, next) => {
    const { name, id } = req.user
    if (!name) {
      throw next(new AuthenticationError('Unable to get user info'))
    }
    res.formatSend({ name, id })
  })
}