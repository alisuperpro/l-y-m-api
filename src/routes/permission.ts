import express from 'express'
import { PermissionController } from '../controller/permission'

export const permisionRouter = express.Router()

permisionRouter.get('/', PermissionController.getAll)

permisionRouter.post('/add', PermissionController.add)
