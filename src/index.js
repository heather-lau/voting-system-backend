import 'babel-polyfill'
import express from 'express'

import CONFIG from './config/config'
import router from './routes'
import { BaseError, ResourceNotFoundError } from './error'

const app = express()

app.use('/', router)

app.use((req, res, next) => {
  next(new ResourceNotFoundError)
})

app.use((err, req, res, next) => {
  const { code, message } = err
  if (err instanceof BaseError) {
    res.status(err.status).send({ errMsg: message, errCode: code })
  } else {
    res.status(500).send({ errMsg: message })
  }
})

app.listen(CONFIG.port, CONFIG.host, () => {
  console.log(`Sever running at ${CONFIG.port}:${CONFIG.host}`)
})