import mongoose from 'mongoose'

const Schema = mongoose.Schema

const status = ['Pending', 'Started', 'Ended', 'Deleted']

const VoteOptionSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Option name is required.']
  }
})

const CampaignSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required.']
  },
  description: {
    type: String
  },
  voteOptions: [VoteOptionSchema],
  hostBy: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  starts: {
    type: Date,
    required: [true, 'Starts datetime is required']
  },
  ends: {
    type: Date,
    required: [true, 'Ends datetime is required']
  },
  status: {
    type: String,
    enum: status
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

CampaignSchema.pre('save', function(next) {
  let now = Date.now()

  if (now < this.starts) { 
    this.status = 'Pending'
  } else if ( now < this.ends ) {
    this.status = 'Started'
  } else {
    this.status = 'Ended'
  }
  next()
})

const Campaign = mongoose.model('Campaign', CampaignSchema)

export default Campaign