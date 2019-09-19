import mongoose from 'mongoose'

const Schema = mongoose.Schema

const VoteOptionSchema = new Schema({

})

const VoteOption = mongoose.model('VoteOption', VoteOptionSchema)

export default VoteOption