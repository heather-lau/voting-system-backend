import mongoose from 'mongoose'

const Schema = mongoose.Schema

const VoteSchema = new Schema({
  voter: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: [true, 'Voter is required.']
  },
  voteOptions: {
    type: mongoose.Types.ObjectId,
    ref: 'Campaign.voteOptions'
  }
}, { timestamps: true })

const Vote = mongoose.model('Vote', VoteSchema)

export default Vote