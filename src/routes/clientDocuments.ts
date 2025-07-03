import { Router } from 'express'
import { ClientDocumentsController } from '../controller/clientDocuments'
import { verifyToken } from '../middleware/verifyToken'
import { setRoutePermission } from '../middleware/loadPermission'
import { auth } from '../middleware/auth'

export const clientDocumentsRouter = Router()

clientDocumentsRouter.get(
    '/client/:clientId',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    ClientDocumentsController.findByClientId
)
clientDocumentsRouter.get(
    '/:id',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    ClientDocumentsController.findById
)

clientDocumentsRouter.post(
    '/add',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    ClientDocumentsController.add
)
