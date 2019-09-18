import express from 'express'

import user_controller from '../controllers/users'

const router = express.Router()

router.all('*', (req, res, next) => {
  res.formatSend = (payload, status=200) => {
    return res.status(status).send({ payload })
  }
  return next()
})

// User routes
router.post('/signup', user_controller.signup )
// router.post('/signin', )

// Campaign routes
// router.get('/campaign', )
// router.post('/campaign', )
// router.get('/campaign/:id', )
// router.put('/campaign/:id', )
// router.delete('/campaign/:id', )
// router.post('/campaign/:id/vote', )

export default router