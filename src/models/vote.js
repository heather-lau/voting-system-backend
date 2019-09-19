import mongoose from 'mongoose'

const Schema = mongoose.Schema

const VoteSchema = new Schema({

})

const Vote = mongoose.model('Vote', VoteSchema)

export default Vote