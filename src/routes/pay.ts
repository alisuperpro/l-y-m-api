import { Router } from 'express'
import { PayController } from '../controller/pay'

export const payRouter = Router()

payRouter.get('/', PayController.getAll)
payRouter.get('/:id', PayController.getById)

payRouter.post('/add', PayController.add)
