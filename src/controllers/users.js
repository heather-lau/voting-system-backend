import asyncHandler from 'express-async-handler'

import User from '../models/user'
import { BadRequestError } from '../error'

export default {
  signup: asyncHandler(async (req, res, next) => {
    const { name, hkid, email, password } = req.body
    if ( !name || !hkid || !email || !password ) {
      return next(new BadRequestError('Name, HKID, Email and Password are required'))
    }
    const createdUser = await User.create(req.body)
    res.formatSend({ result: 'ok' })
  }),

  signin: asyncHandler(async (req, res, next) => {
    if ( !email || !password ) {
      return next(new BadRequestError('Name, Password are required'))
    }
    res.formatSend({ result: 'ok' })
  })
}