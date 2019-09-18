//@flow

import todosRouter from './todos'
import userRouter from './user'

export const combineRouters = (app: Object<>): void => {
  app.use('/todos', todosRouter)
  app.use('/user', userRouter)
}
