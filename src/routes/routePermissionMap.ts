import { Router } from 'express'
import { RoutePermissionMapController } from '../controller/routePermissionMap'

export const routePermissionMapRouter = Router()

routePermissionMapRouter.get('/', RoutePermissionMapController.getAll)
routePermissionMapRouter.get(
    '/:permissionId',
    RoutePermissionMapController.getByPermissionId
)

routePermissionMapRouter.post('/add', RoutePermissionMapController.add)
