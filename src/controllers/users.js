import asyncHandler from 'express-async-handler'

import User from '../models/user'
import tokenHelper from '../utils/token'
import { BadRequestError } from '../error'

export default {
  // Handle signup by POST
  signup: asyncHandler(async (req, res, next) => {
    const { name, hkid, email, password } = req.body
    if ( !name || !hkid || !email || !password ) {
      return next(new BadRequestError('Name, HKID, Email and Password are required'))
    }

    const createdUser = await User.create(req.body)

    res.formatSend({
      'result': 'created',
      '_id': createdUser._id
    }, 201)
  }),

  // Handle signin by POST
  signin: asyncHandler(async (req, res, next) => {
    const { email, password} = req.body
    if ( !email || !password ) {
      return next(new BadRequestError('Name, Password are required'))
    }
    
    const user = await User.authenticate(email, password)
    if (!user) {
      return next(new BadRequestError('Invaild email or password'))
    }

    const accessToken = await tokenHelper.createAccessToken(user)
    const expiredAt = await tokenHelper.getExpiry(accessToken)

    res.formatSend({
      accessToken,
      expiredAt
    })
  })
}