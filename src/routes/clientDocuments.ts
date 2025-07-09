import { Router } from 'express'
import { ClientDocumentsController } from '../controller/clientDocuments'
import { verifyToken } from '../middleware/verifyToken'
import { setRoutePermission } from '../middleware/loadPermission'
import { auth } from '../middleware/auth'
import { verifyExpireClientDebt } from '../middleware/verifyExpireClientDebt'

export const clientDocumentsRouter = Router()
clientDocumentsRouter.use(
    setRoutePermission.setRouteResources('client_documents')
)

clientDocumentsRouter.get(
    '/client/:clientId',
    verifyToken,
    verifyExpireClientDebt,
    setRoutePermission.loadRoutePermission,
    auth,
    ClientDocumentsController.findByClientId
)
clientDocumentsRouter.get(
    '/:id',
    verifyToken,
    verifyExpireClientDebt,
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
