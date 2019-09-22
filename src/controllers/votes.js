import asyncHandler from 'express-async-handler'
import { Types as mongooseTypes } from 'mongoose'

import Vote from '../models/vote'

import { BadRequestError, ResourceNotFoundError } from '../error'

export default {
  create: asyncHandler(async (req, res, next) => {
    const { voter, voteOption } = req.body
    if (!voter || !voteOption) {
      return next(new BadRequestError)
    }
    let createdVote = await Vote.create(req.body)

    res.formatSend(createdVote, 201)
  })
}