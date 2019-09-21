import asyncHandler from 'express-async-handler'
import { Types as mongooseTypes } from 'mongoose'

import Campaign from '../models/campaign'
import Vote from '../models/vote'
import { BadRequestError, ResourceNotFoundError } from '../error'

export default {
  list: asyncHandler(async (req, res, next) => {
    const campaignList = await Campaign
      .find({})
      .populate('hostBy', 'name')
    res.formatSend(campaignList)
  }),

  details: asyncHandler(async (req, res, next) => {
    const { id } = req.params

    // Validate object id 
    const isVaildId = mongooseTypes.ObjectId.isValid(id)
    if (!isVaildId) {
      throw next(new ResourceNotFoundError())
    }

    // Find the campaign
    const campaignDetails = await Campaign
      .findById(id)
      .populate('hostBy', 'name')
    res.formatSend(campaignDetails)
  }),

  create: asyncHandler(async (req, res, next) => {
    const { title, voteOptions, starts, ends } = req.body
    if (!title || !voteOptions || !starts || !ends) {
      return next(new BadRequestError(
        'title, vote options, starts and ends is required'
      ))
    }
    let voteOptionsObj = voteOptions.map(voteOption => (
      { name: voteOption }
    ))
    let createdCampaign = await Campaign.create({
      ...req.body, 
      voteOptions: voteOptionsObj
    })

    res.formatSend(createdCampaign, 201)
  }),
  
  update: asyncHandler(async (req, res, next) => {
    const { id } = req.params

    // Validate object id 
    const isVaildId = mongooseTypes.ObjectId.isValid(id)
    if (!isVaildId) {
      throw next(new ResourceNotFoundError())
    }

    // Check required fields
    const { title, voteOptions, starts, ends } = req.body
    if (!title || !voteOptions || !starts || !ends) {
      return next(new BadRequestError(
        'title, vote options, starts and ends is required'
      ))
    }

    let voteOptionsObj = voteOptions.map(voteOption => (
      { name: voteOption }
    ))

    const updatedCampaign = await Campaign.updateOne({ _id: req.params.id },{
      ...req.body, 
      voteOptions: voteOptionsObj
    })

    res.formatSend(updatedCampaign, 201)
  }),

  // Handle delete a campaign by DELETE
  delete: asyncHandler(async (req, res, next) => {
    const { id } = req.params

    // Validate object id 
    const isVaildId = mongooseTypes.ObjectId.isValid(id)
    if (!isVaildId) {
      throw next(new ResourceNotFoundError())
    }

  })
}