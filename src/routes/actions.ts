import { Router } from 'express'
import { ActionsController } from '../controller/actions'
import { verifyToken } from '../middleware/verifyToken'
import { setRoutePermission } from '../middleware/loadPermission'
import { auth } from '../middleware/auth'
export const actionsRouter = Router()
actionsRouter.use(setRoutePermission.setRouteResources('actions'))

actionsRouter.get(
    '/',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    ActionsController.getAll
)
actionsRouter.get(
    '/:id',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    ActionsController.getById
)

actionsRouter.post(
    '/add',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    ActionsController.add
)
