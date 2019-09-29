import express from 'express'

import auth from '../middlewares/auth'
import user_controller from '../controllers/users'
import campaign_controller from '../controllers/campaigns'

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
router.get('/campaign', campaign_controller.list)
router.post('/campaign', auth.requireLogin, campaign_controller.create)
router.get('/campaign/user', auth.requireLogin, campaign_controller.listByUser)
router.get('/campaign/:id', campaign_controller.details)
router.put('/campaign/:id', auth.requireLogin, campaign_controller.update)
router.delete('/campaign/:id', auth.requireLogin, campaign_controller.delete)
router.post('/campaign/:id/vote', auth.requireLogin, campaign_controller.vote)

export default router