import { Router } from 'express'
import { StatesController } from '../controller/states'
import { verifyToken } from '../middleware/verifyToken'
import { setRoutePermission } from '../middleware/loadPermission'
import { auth } from '../middleware/auth'

export const statesRouter = Router()
statesRouter.use(setRoutePermission.setRouteResources('states'))

statesRouter.get(
    '/:id',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    StatesController.findById
)
statesRouter.get(
    '/',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    StatesController.getAllStates
)
statesRouter.get(
    '/resources/:resource',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    StatesController.getAllStateByResources
)

statesRouter.post(
    '/add',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    StatesController.add
)
