import asyncHandler from 'express-async-handler'

import tokenHelper from '../utils/token'
import { ForbiddenError } from '../error'

export default {
  requireLogin: asyncHandler(async (req, res, next) => {
    const bearerHeader = req.headers['authorization'] || req.headers['Authorization']
    if (typeof bearerHeader == 'undefined') {
      throw (new ForbiddenError('You must be logged in to view this page'))
    }
    const accessToken = bearerHeader.slice(7)
    const verifiedUser = await tokenHelper.verifyAccessToken(accessToken)
    const userData = await tokenHelper.getUserData(verifiedUser.id)
    req.user = userData
    return next()
  })
}