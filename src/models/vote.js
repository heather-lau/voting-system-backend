import mongoose from 'mongoose'

const Schema = mongoose.Schema

const VoteSchema = new Schema({
  voter: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: [true, 'Voter is required.']
  },
  voteOption: {
    type: mongoose.Types.ObjectId,
    ref: 'Campaign.voteOptions',
    required: [true, 'Vote option is required.']
  },
  campaign: {
    type: mongoose.Types.ObjectId,
    ref: 'Campaign'
  }
}, { timestamps: true })

const Vote = mongoose.model('Vote', VoteSchema)

export default Vote