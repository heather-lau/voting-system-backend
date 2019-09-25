import mongoose from 'mongoose'
import bcrpyt from 'bcrypt'

import { AuthenticationError, BadRequestError } from '../error'

const Schema = mongoose.Schema

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required.']
  },
  hkid: {
    type: String,
    unique: true,
    required: [true, 'HKID is required,'],
    validate: {
      validator: (v) => {
        return /^([A-Z]{1,2})([0-9]{6})([A0-9])$/.test(v)
      },
      message: 'Please enter a vaild HKID.'
    }
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    required: [true, 'Email is required.'],
    validate: {
      validator: (v) => {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v)
      },
      message: 'Please enter a vaild email.'
    }
  },
  password: {
    type: String,
    trim: true,
    retuired: [true, 'Password is required.'],
    validate: {
      validator: (v) => {
        return v && v.length >= 6
      },
      message: 'Password must be at least 6 characters.'
    }
  }
}, { timestamps: true })

UserSchema.statics = {
  async authenticate(email, password) {
    try {
      // Find user from database
      const user = await User.findOne({email})
      if (!user) {
        throw (new AuthenticationError('User not found'))
      }
      // Compare password
      const authenticated = await bcrpyt.compare(password, user.password)
      if (!authenticated) {
        throw (new AuthenticationError('Invaild email or password'))
      }
      return user
    } catch(err) {
      throw (err)
    }
  }
}

UserSchema.pre('save', async function(next) {
  try {
    let salt = await bcrpyt.genSalt(10)
    this.password = await bcrpyt.hash(this.password, salt)
    const users = await this.constructor.find({}).select('hkid')
    const hkids = users.map(user => user.hkid)
    for (let hkid of hkids) {
      const existingHkid = await bcrpyt.compare(this.hkid, hkid)
      if (existingHkid) { 
        throw (new BadRequestError('This HKID is already used.'))
      }
    }
    this.hkid = await bcrpyt.hash(this.hkid, salt)
    next()
  } catch(err) {
    return next(err)
  }
})

const User = mongoose.model('User', UserSchema)

export default User