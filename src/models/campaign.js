import mongoose from 'mongoose'

const Schema = mongoose.Schema

const status = ['Pending', 'Started', 'Ended']

const VoteOptionSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Option name is required.']
  },
  totalVotes: {
    type: Number,
    default: 0
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
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

CampaignSchema.statics = {
  async softDeleteById(id) {
    try {
      const campaign = await Campaign.updateOne({ _id: id }, {isDeleted: true})
      return campaign.isDeleted
    } catch(err) {
      throw err
    }
  }
}

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

CampaignSchema.pre('updateOne', function(next) {
  let now = Date.now()
  let startDate = Date.parse(this._update.starts)
  let endDate = Date.parse(this._update.ends)
  if (now < startDate) { 
    this._update.status = 'Pending'
  } else if ( now < endDate ) {
    this._update.status = 'Started'
  } else {
    this._update.status = 'Ended'
  }
  next()
})

CampaignSchema.pre(['find', 'findOne'], function() {
  this
    .where({isDeleted: { $ne: true }})
    .select(['-isDeleted', '-__v'])
})

const Campaign = mongoose.model('Campaign', CampaignSchema)

export default Campaign