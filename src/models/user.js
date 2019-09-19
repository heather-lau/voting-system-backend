import mongoose from 'mongoose'

const Schema = mongoose.Schema

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'This field is required']
  },
  hkid: {
    type: String,
    unique: true,
    required: [true, 'This field is required'],
    validate: {
      validator: (v) => {
        return /^([A-Z]{1,2})([0-9]{6})([A0-9])$/.test(v)
      },
      message: 'Please enter a vaild HKID'
    }
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    required: [true, 'This field is required'],
    validate: {
      validator: (v) => {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v)
      },
      message: 'Please enter a vaild email'
    }
  },
  password: {
    type: String,
    trim: true,
    retuired: [true, 'This field is required'],
    validate: {
      validator: (v) => {
        return v && v.length >= 6
      },
      message: 'This field must be at least 6 characters'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const User = mongoose.model('User', UserSchema)

export default User