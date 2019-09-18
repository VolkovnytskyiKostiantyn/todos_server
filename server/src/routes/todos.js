// @flow
import express from 'express'
import { ObjectID } from 'mongodb'
import mongo from '../db/Mongo'

const todosRouter = express.Router()

todosRouter.get('/all/:login', async (req: $Request, res: $Response): Promise<void> => {
  try {
    const { login } = req.params
    const currentUser = await mongo.getCollection('users').findOne({ login })
    const queryArray = [login, ...currentUser.externalUsers].map((user) => ({
      owner: user,
    }))
    const todos = await mongo.getCollection('todos').find({ $or: queryArray }).toArray()
    res.send(todos)
  } catch (e) {
    res.sendStatus(404)
    console.error(e)
  }
})

todosRouter.get(
  '/:choosenUser',
  async (req: $Request, res: $Response): Promise<void> => {
    try {
      const todos = await mongo.getCollection('todos').find({ owner: req.params.choosenUser }).toArray()
      res.send(todos)
    } catch (e) {
      res.sendStatus(404)
      console.error(e)
    }
  },
)

todosRouter.post('/', async (req: $Request, res: $Response): Promise<void> => {
  try {
    const { title, owner } = req.body
    console.log('owner: ', owner);
    console.log('title: ', title);
    const newTodo = {
      title,
      owner,
      isCompleted: false,
    }
    const response = await mongo.getCollection('todos').insertOne(newTodo)
    console.log('response: ', response);
    console.log('response: ', response.insertedId);
    res.send(response.insertedId)
  } catch (e) {
    res.sendStatus(404)
    console.error(e)
  }
})

todosRouter.delete(
  '/',
  async (req: $Request, res: $Response): Promise<void> => {
    try {
      const { _id } = req.body
      const response = await mongo.getCollection('todos').deleteOne({ _id: ObjectID(_id) })
      res.send(response)
    } catch (e) {
      res.sendStatus(404)
      console.error(e)
    }
  },
)

todosRouter.delete(
  '/delete_many',
  async (req: $Request, res: $Response): Promise<void> => {
    try {
      const { idArr } = req.body
      const query = idArr.map((id) => ({ _id: ObjectID(id) }))
      const response = await mongo.getCollection('todos').deleteMany({ $or: query })
      res.send(response)
    } catch (e) {
      res.sendStatus(404)
      console.error(e)
    }
  },
)

todosRouter.put('/', async (req: $Request, res: $Response): Promise<void> => {
  try {
    const { _id, updKeyValue } = req.body
    const response = await mongo.getCollection('todos').updateOne(
      { _id: ObjectID(_id) }, { $set: updKeyValue }
    )
    console.log('id', response)
    res.send(response)
  } catch (e) {
    res.sendStatus(404)
    console.error(e)
  }
})

export default todosRouter
