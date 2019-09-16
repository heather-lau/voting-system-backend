import dotenvFlow from 'dotenv-flow'
dotenvFlow.config()

export default {
  app  : process.env.APP,
  host : process.env.HOST,
  port : process.env.PORT
}