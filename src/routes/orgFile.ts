import { Router } from 'express'
import { OrgFileController } from '../controller/orgFile'

export const orgFileRouter = Router()

orgFileRouter.get('/', OrgFileController.getAll)
orgFileRouter.get('/org/:id', OrgFileController.getByOrgId)

orgFileRouter.post('/add', OrgFileController.add)
