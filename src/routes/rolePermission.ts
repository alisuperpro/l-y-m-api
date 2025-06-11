import express from 'express'
import { RolePermissionController } from '../controller/rolePermission'

export const rolePermissionRouter = express.Router()

rolePermissionRouter.get('/', RolePermissionController.getAll)
rolePermissionRouter.get('/role/:roleId', RolePermissionController.findByRoleId)
rolePermissionRouter.get(
    '/permission/:permissionId',
    RolePermissionController.findByPermissionId
)

rolePermissionRouter.post('/add', RolePermissionController.add)
