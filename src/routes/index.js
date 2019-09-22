import express from 'express'

import user_controller from '../controllers/users'
import campaign_controller from '../controllers/campaigns'
import vote_controller from '../controllers/votes'

const router = express.Router()

router.all('*', (req, res, next) => {
  res.formatSend = (payload, status=200) => {
    return res.status(status).send({ payload })
  }
  return next()
})

// User routes
router.post('/signup', user_controller.signup)
// router.post('/signin', )

// Campaign routes
router.get('/campaign', campaign_controller.list)
router.post('/campaign', campaign_controller.create)
router.get('/campaign/:id', campaign_controller.details)
router.put('/campaign/:id', campaign_controller.update)
router.delete('/campaign/:id', campaign_controller.delete)

router.post('/vote', vote_controller.create)

export default router