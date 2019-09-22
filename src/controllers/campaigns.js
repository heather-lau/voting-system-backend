import asyncHandler from 'express-async-handler'
import { Types as mongooseTypes } from 'mongoose'

import Campaign from '../models/campaign'
import Vote from '../models/vote'
import { BadRequestError, ResourceNotFoundError } from '../error'

export default {
  list: asyncHandler(async (req, res, next) => {
    
    const startedCampaigns = await Campaign
      .find({status: 'Started'})
      .sort({date: -1})
      .populate('hostBy', 'name')

    const pendingCampaigns = await Campaign
      .find({status: 'Pending'})
      .sort({date: -1})
      .populate('hostBy', 'name')
    
    const endedCampaigns = await Campaign
      .find({status: 'Ended'})
      .sort({date: -1})
      .populate('hostBy', 'name')

    const campaigns = startedCampaigns.concat(pendingCampaigns, endedCampaigns)
    res.formatSend(campaigns)
  }),

  details: asyncHandler(async (req, res, next) => {
    const { id } = req.params

    // Validate object id 
    const isVaildId = mongooseTypes.ObjectId.isValid(id)
    if (!isVaildId) {
      return next(new ResourceNotFoundError())
    }

    // Find the campaign
    const campaignDetails = await Campaign
      .findOne({_id: id})
      .populate('hostBy', 'name')

    if (!campaignDetails) {
      return next(new ResourceNotFoundError())
    }

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

    // Check if Campaign exists
    const campaignDetails = await Campaign.findOne({ _id: id })
    if (!campaignDetails) {
      return next(new ResourceNotFoundError())
    }

    const updatedCampaign = await Campaign.updateOne({ _id: id },{
      ...req.body, 
      voteOptions: voteOptionsObj
    })

    res.formatSend(updatedCampaign)
  }),

  // Handle delete a campaign by DELETE
  delete: asyncHandler(async (req, res, next) => {
    const { id } = req.params

    // Validate object id 
    const isVaildId = mongooseTypes.ObjectId.isValid(id)
    if (!isVaildId) {
      throw next(new ResourceNotFoundError())
    }

    const deletedCampaign = await Campaign.softDeleteById(id)

    res.formatSend({result: 'deleted'})
  })
}