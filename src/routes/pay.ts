import { Router } from 'express'
import { PayController } from '../controller/pay'
import { verifyToken } from '../middleware/verifyToken'
import { setRoutePermission } from '../middleware/loadPermission'
import { auth } from '../middleware/auth'

export const payRouter = Router()

payRouter.use(setRoutePermission.setRouteResources('pay'))

payRouter.get(
    '/',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    PayController.getAll
)
payRouter.get(
    '/:id',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    PayController.getById
)
payRouter.get(
    '/status/:status',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    PayController.getByStatus
)
payRouter.get(
    '/client/:clientId',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    PayController.getByClientId
)

payRouter.post(
    '/add',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    PayController.add
)

payRouter.put(
    '/update/status/:id',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    PayController.updateStatus
)
