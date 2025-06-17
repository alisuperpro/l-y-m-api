import { Router } from 'express'
import { ActionsController } from '../controller/actions'

export const actionsRouter = Router()

actionsRouter.get('/', ActionsController.getAll)
actionsRouter.get('/:id', ActionsController.getById)

actionsRouter.post('/add', ActionsController.add)
