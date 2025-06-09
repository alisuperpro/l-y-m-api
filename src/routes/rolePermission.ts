import express from 'express'
import { RolePermissionController } from '../controller/rolePermission'

export const rolePermissionRouter = express.Router()

rolePermissionRouter.get('/', RolePermissionController.getAll)

rolePermissionRouter.post('/add', RolePermissionController.add)
