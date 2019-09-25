import asyncHandler from 'express-async-handler'
import { Types as mongooseTypes } from 'mongoose'

import Campaign from '../models/campaign'
import Vote from '../models/vote'

import { BadRequestError, ResourceNotFoundError } from '../error'

export default {
  // Display list of all campaigns
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

  // Display details of a campaign
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

  // Handle create a campaign by POST
  create: asyncHandler(async (req, res, next) => {
    const { title, voteOptions, starts, ends } = req.body
    if (!title || !voteOptions || !starts || !ends) {
      return next(new BadRequestError(
        'Title, vote options, starts and ends is required'
      ))
    }    
    const voteOptionsObj = voteOptions.map(voteOption => (
      { name: voteOption }
    ))
    const createdCampaign = await Campaign.create({
      ...req.body, 
      voteOptions: voteOptionsObj
    })

    res.formatSend(createdCampaign, 201)
  }),
  
  // Handle update a campaign by PUT
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

    const voteOptionsObj = voteOptions.map(voteOption => (
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
  }),

  // Handle campaign vote by POST
  vote: asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const userId = req.user.id

    // Validate object id 
    const isVaildId = mongooseTypes.ObjectId.isValid(id)
    if (!isVaildId) {
      throw next(new ResourceNotFoundError())
    }

    const { voteOption } = req.body
    if (!voteOption) {
      return next(new BadRequestError('Vote option is required'))
    }

    // Check if user already voted this campaign
    const votedCampaign = await Vote.findOne({ voter: userId, campaign: id })
    if (votedCampaign) {
      return next(new BadRequestError('You can only vote once in each campaign'))
    }

    // Check if the campaign status is not Started
    const campaign = await Campaign.findOne({_id: id})
    if (campaign.status == 'Ended') {
      return next(new BadRequestError('This campaign has ended'))
    } else if (campaign.status == 'Pending') {
      return next(new BadRequestError('This campaign is not available for vote yet'))
    }

    // Create vote
    const createdVote = await Vote.create({voteOption, voter: userId, campaign: id})

    // Update number of votes
    const updatedTotalVote = await Campaign.update({'voteOptions._id': voteOption}, {'$inc': {'voteOptions.$.totalVotes': 1}})

    res.formatSend(createdVote, 201)
  })
}