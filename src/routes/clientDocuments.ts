import { Router } from 'express'
import { ClientDocumentsController } from '../controller/clientDocuments'
import { verifyToken } from '../middleware/verifyToken'
import { setRoutePermission } from '../middleware/loadPermission'
import { auth } from '../middleware/auth'
import { verifyExpireClientDebtMiddleware } from '../middleware/verifyExpireClientDebt'

export const clientDocumentsRouter = Router()
clientDocumentsRouter.use(
    setRoutePermission.setRouteResources('client_documents')
)

clientDocumentsRouter.get(
    '/client/:clientId',
    verifyToken,
    verifyExpireClientDebtMiddleware,
    setRoutePermission.loadRoutePermission,
    auth,
    ClientDocumentsController.findByClientId
)
clientDocumentsRouter.get(
    '/:id',
    verifyToken,
    verifyExpireClientDebtMiddleware,
    setRoutePermission.loadRoutePermission,
    auth,
    ClientDocumentsController.findById
)

clientDocumentsRouter.get(
    '/download/:clientId/:documentId',
    verifyToken,
    verifyExpireClientDebtMiddleware,
    setRoutePermission.loadRoutePermission,
    auth,
    ClientDocumentsController.ClientDocumentUrl
)

clientDocumentsRouter.get(
    '/find/:org/:slug',
    verifyToken,
    verifyExpireClientDebtMiddleware,
    setRoutePermission.loadRoutePermission,
    auth,
    ClientDocumentsController.getByOrgAndSlug
)

clientDocumentsRouter.get(
    '/admin/find/:org/:slug',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    ClientDocumentsController.getByOrgAndSlug
)

clientDocumentsRouter.get(
    '/',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    ClientDocumentsController.getAll
)

clientDocumentsRouter.post(
    '/add',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    ClientDocumentsController.add
)

clientDocumentsRouter.put(
    '/:id',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    ClientDocumentsController.updateFile
)
