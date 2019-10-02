import express from 'express'

import auth from '../middlewares/auth'
import user_controller from '../controllers/users'
import campaign_controller from '../controllers/campaigns'
import user_campaign_controller from '../controllers/userCampaigns'

const router = express.Router()

router.all('*', (req, res, next) => {
  res.formatSend = (payload, status=200) => {
    return res.status(status).send({ payload })
  }
  return next()
})

// User routes
router.post('/signup', user_controller.signup)
router.post('/signin', user_controller.signin)
router.get('/access', auth.requireLogin, user_controller.access)

// Campaign routes 
router.get('/campaigns', campaign_controller.list)
router.get('/campaigns/:id', auth.determineUserLogin, campaign_controller.details)
router.post('/campaigns/:id/vote', auth.requireLogin, campaign_controller.vote)

// User Campaign routes
router.use('/user', auth.requireLogin)
router.get('/user/campaigns', user_campaign_controller.list)
router.post('/user/campaigns', user_campaign_controller.create)
router.get('/user/campaigns/:id', user_campaign_controller.details)
router.put('/user/campaigns/:id', user_campaign_controller.update)
router.delete('/user/campaigns/:id', user_campaign_controller.delete) 

export default router