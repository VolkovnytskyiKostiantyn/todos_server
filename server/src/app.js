// @flow
import express from 'express'
import path from 'path'
import { createServer } from 'http'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import jwt from 'express-jwt'
// import indexRouter from './routes/index'
import userRouter from './routes/user'
import todosRouter from './routes/todos'
import mongo from './db/Mongo'

async function boot() {
  await mongo.connect()

  const app = express()
  app.use((req: $Request, res: $Response, next: NextFunction) => {
    res.append('Access-Control-Allow-Origin', ['*'])
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    res.append('Access-Control-Allow-Headers', 'Content-Type')
    res.append('Access-Control-Allow-Headers', 'Authorization')
    res.append('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers')
    res.append('Access-Control-Allow-Headers', 'X-Requested-With')
    next()
  })
  app.use(logger('dev'))
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(cookieParser())
  app.use(express.static(path.join(__dirname, '../public')))
  app.use(jwt({ secret: 'salt' }).unless({ path: ['/user/signUp', '/user/login'] }))
  app.use('/user', userRouter)
  app.use('/todos', todosRouter)

  app.listen(3011, () => {
    console.log(`started localhost:3011`);
  })
}

boot()
