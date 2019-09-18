import 'babel-polyfill'
import express from 'express'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'

import CONFIG from './config/config'
import router from './routes'
import { BaseError, ResourceNotFoundError } from './error'

const app = express()

/*
** Set up databse connection
*/
mongoose.connect(
  `mongodb://${CONFIG.db_host}:${CONFIG.db_port}/${CONFIG.db_name}`, 
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  }
)

mongoose.connection.on('error', (err) => {
  console.log(`Database error: ${err}`)
})

/*
** Set up server
*/ 
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/', router)

app.use((req, res, next) => {
  console.log('hi')
  next(new ResourceNotFoundError())
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
  console.log(`Sever running at ${CONFIG.host}:${CONFIG.port}`)
})