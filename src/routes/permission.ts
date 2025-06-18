import express from 'express'
import { PermissionController } from '../controller/permission'

export const permisionRouter = express.Router()

permisionRouter.get('/', PermissionController.getAll)
permisionRouter.get('/:id', PermissionController.getById)

permisionRouter.post('/add', PermissionController.add)
