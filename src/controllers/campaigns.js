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
    filter.status = { "$in": ['Started', 'Ended'] }
    if (status) {
      status.toLowerCase()
      switch (status) {
        case 'started':
          filter.status = 'Started'
          break
        case 'ended': 
          filter.status = 'Ended'
          break
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
    const { id } = req.params

    // Validate object id 
    const isVaildId = mongooseTypes.ObjectId.isValid(id)
    if (!isVaildId) {
      return next(new ResourceNotFoundError())
    }

    // Find the campaign
    const campaign = await Campaign
      .findOne({ _id: id }) // stauts should be started or ended
      .populate('hostBy', 'name')

    if (!campaign) {
      return next(new ResourceNotFoundError())
    }

    // Sum up the total votes
    const voteOptions = await campaign.voteOptions
    const totalVotes = voteOptions.reduce((sum, voteOption) => sum + voteOption.totalVotes, 0)
    
    // Find the user vote
    let userVoted = null
    if (req.user) {
      const vote = await Vote
        .findOne({ voter: req.user.id, campaign: id })
        .populate('campaign')
      if (vote) {
        userVoted = await voteOptions.find(({ _id }) => vote.voteOption.equals(_id))
      }
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

    res.formatSend({ result: 'created', _id: createdVote._id }, 201)
  })
}