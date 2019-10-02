import asyncHandler from 'express-async-handler'
import { Types as mongooseTypes } from 'mongoose'

import Campaign from '../models/campaign'
import Vote from '../models/vote'

import { BadRequestError, ResourceNotFoundError, ForbiddenError } from '../error'

export default {
  // Display list of all campaigns
  list: asyncHandler(async (req, res, next) => {
    let filter = {}
    const { status } = req.query
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
        default:
          filter = {}
      }
    }

    const foundCampaigns = await Campaign
      .find(filter)
      .sort({date: -1})
      .populate('hostBy', 'name')

    // Calculate sum of votes
    const campaigns = foundCampaigns.map(campaign => {
      let voteOptions = campaign.voteOptions
      let totalVotes = voteOptions.reduce((sum, voteOption) => sum + voteOption.totalVotes, 0)
      return {...campaign.toJSON(), totalVotes}
    })

    res.formatSend(campaigns)
  }),

  // Display list of all campaigns
  listByUser: asyncHandler(async (req, res, next) => {
    const userId = req.user.id
    const { status } = req.query

    let filter = {}
    filter.hostBy = userId
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
        default:
          filter = {}
      }
    }

    const foundCampaigns = await Campaign
      .find(filter)
      .sort({date: -1})
      .populate('hostBy', 'name')

    // Calculate sum of votes
    const campaigns = foundCampaigns.map(campaign => {
      let voteOptions = campaign.voteOptions
      let totalVotes = voteOptions.reduce((sum, voteOption) => sum + voteOption.totalVotes, 0)
      return { ...campaign.toJSON(), totalVotes }
    })

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
      .findOne({ _id: id })
      .populate('hostBy', 'name')

    if (!campaignDetails) {
      return next(new ResourceNotFoundError())
    }

    // Sum up the total votes
    const voteOptions = await campaignDetails.voteOptions
    const totalVotes = voteOptions.reduce((sum, voteOption) => sum + voteOption.totalVotes, 0)
    const payload = { ...campaignDetails.toJSON(), totalVotes }

    // Find the user vote
    if (req.user) {
      const vote = await Vote
        .findOne({ voter: req.user.id, campaign: id })
        .populate('campaign')
      let userVoted = null
      if (vote) {
        const foundVote = await voteOptions.find(({ _id }) => vote.voteOption.equals(_id))
        userVoted = { id: foundVote._id, name: foundVote.name }
      }
      payload.userVoted = userVoted
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

    res.formatSend(createdCampaign, 201)
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
    const campaignDetails = await Campaign.findOne({ _id: id })
    if (!campaignDetails) {
      return next(new ResourceNotFoundError())
    }

    // Check if campaign is created by current user
    if (campaignDetails.hostBy !== userId) {
      return next(new ForbiddenError('This campaign is not host by you'))
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

    // Create vote
    const createdVote = await Vote.create({voteOption, voter: userId, campaign: id})
    
    // Update number of voteOption
    const updatedTotalVote = await Campaign.update(
      { 'voteOptions._id': voteOption },
      { '$inc': { 'voteOptions.$.totalVotes': 1 }}
    )

    res.formatSend(createdVote, 201)
  })
}