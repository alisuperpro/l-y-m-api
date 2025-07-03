import { Router } from 'express'
import { RoutePermissionMapController } from '../controller/routePermissionMap'
import { verifyToken } from '../middleware/verifyToken'
import { setRoutePermission } from '../middleware/loadPermission'
import { auth } from '../middleware/auth'
export const routePermissionMapRouter = Router()

routePermissionMapRouter.get(
    '/',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    RoutePermissionMapController.getAll
)
routePermissionMapRouter.get(
    '/:permissionId',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    RoutePermissionMapController.getByPermissionId
)

routePermissionMapRouter.post(
    '/add',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    RoutePermissionMapController.add
)
