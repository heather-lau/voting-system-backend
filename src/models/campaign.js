import mongoose from 'mongoose'

const Schema = mongoose.Schema

const CampaignSchema = new Schema({
  
})

const Campaign = mongoose.model('Campaign', CampaignSchema)

export default Campaign