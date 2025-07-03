import express from 'express'
import { PermissionController } from '../controller/permission'
import { DefaultClientPermissionsController } from '../controller/defaultClientPermissions'
import { verifyToken } from '../middleware/verifyToken'
import { setRoutePermission } from '../middleware/loadPermission'
import { auth } from '../middleware/auth'
export const permisionRouter = express.Router()

permisionRouter.get(
    '/',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    PermissionController.getAll
)
permisionRouter.get(
    '/:id',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    PermissionController.getById
)
permisionRouter.get(
    '/default-client-permission',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    DefaultClientPermissionsController.getAll
)
permisionRouter.get(
    '/default-client-permission/:permissionId',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    DefaultClientPermissionsController.getByPermissionId
)

permisionRouter.post(
    '/add',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    PermissionController.add
)
permisionRouter.post(
    '/add-default-client-permission',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    DefaultClientPermissionsController.add
)
