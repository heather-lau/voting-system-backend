/*
 *  For development testing only
 */

import 'babel-polyfill'
import mongoose from 'mongoose'
import CONFIG from './config/config'
import User from './models/user'
import Campaign from './models/campaign'
import { user, campaigns } from './seed-data'

(async function() {
  try {
    // Connent database
    mongoose.connect(`mongodb://${CONFIG.db_host}:${CONFIG.db_port}/${CONFIG.db_name}`, { 
      useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true
    })
    mongoose.connection.on('error', (err) => {
      console.log('Database error: ', err)
    });

    // Seed user
    const createdUser = await User.create(user);
    const userId = await createdUser._id;

    // Seed campaigns
    const campaignList = campaigns.map(campaign => {
      return { ...campaign, hostBy: userId };
    });
    const createdCampaigns = await Campaign.insertMany(campaignList);

    // Disconnect Database
    console.log('Finished seeding data to database');
    
  } catch(err) {
    console.log(err);
  } finally {
    mongoose.connection.close(() => { console.log('Disconnected database') });
  };
})();