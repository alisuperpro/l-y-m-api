import { Router } from 'express'
import { FileFormController } from '../controller/fileForm'

export const fileFormRouter = Router()

fileFormRouter.get('/', FileFormController.getAll)

fileFormRouter.post('/add', FileFormController.add)
