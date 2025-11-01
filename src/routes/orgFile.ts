import { Router } from 'express'
import { OrgFileController } from '../controller/orgFile'

export const orgFileRouter = Router()

orgFileRouter.get('/', OrgFileController.getAll)

orgFileRouter.post('/add', OrgFileController.add)
