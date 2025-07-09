import { Router } from 'express'
import { ResourcesController } from '../controller/resources'
import { verifyToken } from '../middleware/verifyToken'
import { setRoutePermission } from '../middleware/loadPermission'
import { auth } from '../middleware/auth'
export const resourcesRouter = Router()

resourcesRouter.use(setRoutePermission.setRouteResources('resources'))

resourcesRouter.get(
    '/',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    ResourcesController.getAll
)
resourcesRouter.get(
    '/:id',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    ResourcesController.getById
)

resourcesRouter.post(
    '/add',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    ResourcesController.add
)
