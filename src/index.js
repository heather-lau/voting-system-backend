import 'babel-polyfill'
import express from 'express'
import CONFIG from './config/config'

const app = express()

app.listen(CONFIG.port, CONFIG.host, () => {
  console.log(`Sever running at ${CONFIG.port}:${CONFIG.host}`)
})