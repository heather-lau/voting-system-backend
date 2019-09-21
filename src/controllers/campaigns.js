import asyncHandler from 'express-async-handler'

import Campaign from '../models/campaign'
import Vote from '../models/vote'
import { BadRequestError } from '../error'

export default {
  list: asyncHandler(async (req, res, next) => {
    
  }),
  create: asyncHandler(async (req, res, next) => {
    const { title, description, voteOptions, starts, ends } = req.body
    if (!title || !voteOptions || !starts || !ends) {
      return next(new BadRequestError(
        'title, vote options, starts and ends is required'
      ))
    }
    let voteOptionsObj = voteOptions.map(voteOption => (
      { name: voteOption }
    ))
    let createdCampaigns = await Campaign.create({
      ...req.body, 
      voteOptions: voteOptionsObj
    })

    res.formatSend({ result: 'ok' })
  }),
  update: asyncHandler(async (req, res, next) => {
    const {} = req.body
  }),
  delete: asyncHandler(async (req, res, next) => {
    
  })
}