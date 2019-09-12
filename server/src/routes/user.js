// @flow
import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

import mongo from '../db/Mongo'

const userRouter = express.Router()
userRouter.post('/signUp', async (req: $Request, res: $Response): void => {
  try {
    const { login, password } = req.body
    const token = await jwt.sign({ login }, 'salt')
    const hashedPassword = await bcrypt.hash(password, 10)
    mongo.getCollection('users').insertOne({
      login,
      hashedPassword,
      sharedUsers: [],
      externalUsers: [],
      token
    })
    res.send(token)
  } catch (e) {
    console.error(e)
  }
})

userRouter.post('/login', async (req: $Request, res: $Response): void => {
  try {
    const { login, password } = req.body
    const user = await mongo.getCollection('users').findOne({ login })
    const { token, hashedPassword } = user
    await bcrypt.compare(password, hashedPassword).then(async (isEqual) => {
      if (isEqual) {
        res.send(token)
      } else {
        res.sendStatus(403).send('Wrong password')
      }
    })
  } catch (e) {
    console.error(e)
  }
})

userRouter.get('/', async (req: $Request, res: $Response): void => {
  try {
    const { login } = req.body
    const user = await mongo.getCollection('users').findOne({ login })
    const { sharedUsers, externalUsers } = user
    res.send({ sharedUsers, externalUsers })
  } catch (e) {
    console.error(e)
  }
})

userRouter.get('/get/:username', async (req: $Request, res: $Response): void => {
  try {
    const { username } = req.params
    const user = await mongo.getCollection('users').findOne({ login: username })
    const { sharedUsers, externalUsers } = user
    res.send(JSON.stringify({
      sharedUsers,
      externalUsers
    }))
  } catch (e) {
    console.error(e)
  }
})

userRouter.post(
  '/addSharedUser',
  async (req: $Request, res: $Response): void => {
    try {
      const { login, newSharedUserLogin } = req.body
      console.log('++++++++')
      const currentUser = await mongo.getCollection('users').findOne({ login })
      const newSharedUser = await mongo.getCollection('users').findOne({ login: newSharedUserLogin })
      if (!newSharedUser) {
        res.sendStatus(418).send('No such user!')
      }
      const currentSharedUsers = currentUser.sharedUsers
      const usersIndex = currentSharedUsers.findIndex(
        (item) => newSharedUserLogin === item,
      )
      const isUserAlreadyShared = usersIndex >= 0

      if (isUserAlreadyShared) {
        console.log('isUserAlreadyShared: ', isUserAlreadyShared);
        const movedUser = currentSharedUsers.splice(usersIndex, 1)
        currentSharedUsers.push(movedUser[0])
        await mongo.getCollection('users').updateOne({ login }, { $set: { sharedUsers: currentSharedUsers } })

      } else {
        console.log('isUserAlreadyShared: ', isUserAlreadyShared);
        currentSharedUsers.push(newSharedUserLogin)
        newSharedUser.externalUsers.push(login)
        await mongo.getCollection('users').updateOne({ login }, { $set: { sharedUsers: currentSharedUsers } })
        await mongo.getCollection('users').updateOne({ login: newSharedUserLogin }, { $set: { externalUsers: newSharedUser.externalUsers } })
      }

      res.send(currentSharedUsers)
    } catch (e) {
      console.error(e)
    }
  },
)

export default userRouter
