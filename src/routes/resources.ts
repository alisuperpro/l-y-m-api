import { Router } from 'express'
import { ResourcesController } from '../controller/resources'

export const resourcesRouter = Router()

resourcesRouter.get('/', ResourcesController.getAll)
resourcesRouter.get('/:id', ResourcesController.getById)

resourcesRouter.post('/add', ResourcesController.add)
