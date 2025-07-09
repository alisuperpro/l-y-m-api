import express from 'express'
import { RolePermissionController } from '../controller/rolePermission'
import { setRoutePermission } from '../middleware/loadPermission'
import { verifyToken } from '../middleware/verifyToken'
import { auth } from '../middleware/auth'

export const rolePermissionRouter = express.Router()

rolePermissionRouter.use(
    setRoutePermission.setRouteResources('role_permission')
)

rolePermissionRouter.get(
    '/',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    RolePermissionController.getAll
)
rolePermissionRouter.get(
    '/role/:roleId',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    RolePermissionController.findByRoleId
)
rolePermissionRouter.get(
    '/permission/:permissionId',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    RolePermissionController.findByPermissionId
)

rolePermissionRouter.post(
    '/add',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    RolePermissionController.add
)
