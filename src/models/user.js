import mongoose from 'mongoose'

const Schema = mongoose.Schema

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'This field is required']
  },
  hkid: {
    type: String,
    unique: [true, 'This field must be unique'],
    required: [true, 'This field is required']
  },
  email: {
    type: String,
    trim: true,
    unique: [true, 'This field must be unique'],
  },
  password: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const User = mongoose.model('User', UserSchema)

export default User