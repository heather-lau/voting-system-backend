import asyncHandler from 'express-async-handler'
import { Types as mongooseTypes } from 'mongoose'

import Campaign from '../models/campaign'
import Vote from '../models/vote'
import { BadRequestError, ResourceNotFoundError, ForbiddenError } from '../error'

export default {
  // Display list of all campaigns
  list: asyncHandler(async (req, res, next) => {
    const { status } = req.query
    let filter = {}
    if (status) {
      status.toLowerCase()
      switch (status) {
        case 'started':
          filter.status = 'Started'
          break
        case 'pending': 
          filter.status = 'Pending'
          break
        case 'ended': 
          filter.status = 'Ended'
          break
      }
    }

    const userId = req.user.id
    filter.hostBy = userId

    const foundCampaigns = await Campaign
      .find(filter)
      .sort({date: -1})
      .populate('hostBy', 'name')

    // Calculate sum of votes
    const campaigns = foundCampaigns.map(campaign => {
      let voteOptions = campaign.voteOptions
      let totalVotes = voteOptions.reduce((sum, voteOption) => sum + voteOption.totalVotes, 0)
      return {
        totalVotes,
        '_id': campaign._id,
        'title': campaign.title,
        'starts': campaign.starts,
        'ends': campaign.ends,
        'hostBy': campaign.hostBy.name,
        'createdAt': campaign.createdAt,
        'updatedAt': campaign.updatedAt,
        'status': campaign.status,
      }
    })

    res.formatSend(campaigns)
  }),

  // Display details of a campaign
  details: asyncHandler(async (req, res, next) => {
    const userId = req.user.id
    const { id } = req.params

    // Validate object id 
    const isVaildId = mongooseTypes.ObjectId.isValid(id)
    if (!isVaildId) {
      return next(new ResourceNotFoundError())
    }

    // Find the campaign
    const campaign = await Campaign
      .findOne({ _id: id, hostBy: userId })
      .populate('hostBy', 'name')

    if (!campaign) {
      return next(new ResourceNotFoundError())
    }

    // Sum up the total votes
    const voteOptions = await campaign.voteOptions
    const totalVotes = voteOptions.reduce((sum, voteOption) => sum + voteOption.totalVotes, 0)

    // Find the user vote
    let userVoted = null
    const vote = await Vote
      .findOne({ voter: req.user.id, campaign: id })
      .populate('campaign')

    if (vote) {
      userVoted = await voteOptions.find(({ _id }) => vote.voteOption.equals(_id))
    }

    const payload = {
      '_id': campaign._id,
      'title': campaign.title,
      'starts': campaign.starts,
      'ends': campaign.ends,
      'hostBy': campaign.hostBy.name,
      'createdAt': campaign.createdAt,
      'updatedAt': campaign.updatedAt,
      'voteOptions': campaign.voteOptions,
      'status': campaign.status,
      totalVotes,
      userVoted
    }

    res.formatSend(payload)
  }),

  // Handle create a campaign by POST
  create: asyncHandler(async (req, res, next) => {
    const userId = req.user.id
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
      hostBy: userId,
      voteOptions: voteOptionsObj
    })

    res.formatSend({ result: 'created', _id: createdCampaign._id }, 201)
  }),
  
  // Handle update a campaign by PUT
  update: asyncHandler(async (req, res, next) => {
    const userId = req.user.id
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

    // Check if campaign exists
    const campaignDetails = await Campaign.findOne({ _id: id, hostBy: userId })
    if (!campaignDetails) {
      return next(new ResourceNotFoundError())
    }

    const updatedCampaign = await Campaign.updateOne({ _id: id }, {
      ...req.body, 
      voteOptions: voteOptionsObj
    })

    res.formatSend({result: 'updated'})
  }),

  // Handle delete a campaign by DELETE
  delete: asyncHandler(async (req, res, next) => {
    const userId = req.user.id
    const { id } = req.params

    // Validate object id 
    const isVaildId = mongooseTypes.ObjectId.isValid(id)
    if (!isVaildId) {
      throw next(new ResourceNotFoundError())
    }

    // Check if campaign exists
    const foundCampaign = await Campaign.findOne({ _id: id, hostBy: userId })
    if (!foundCampaign) {
      return next(new ResourceNotFoundError())
    }

    const deletedCampaign = await Campaign.softDeleteById(id)

    res.formatSend({result: 'deleted'})
  })
}