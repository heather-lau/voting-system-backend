import dotenvFlow from 'dotenv-flow'
dotenvFlow.config()

export default {
  app  : process.env.APP,
  host : process.env.HOST,
  port : process.env.PORT,

  db_host : process.env.DB_HOST,
  db_port : process.env.DB_PORT,
  db_name : process.env.DB_NAME,

  jwt_secret: process.env.JWT_SECRET
}