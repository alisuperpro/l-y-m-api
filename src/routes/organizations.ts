import { Router } from 'express'
import { OrganizationsController } from '../controller/organizations'
import { verifyToken } from '../middleware/verifyToken'
import { setRoutePermission } from '../middleware/loadPermission'
import { auth } from '../middleware/auth'
import dotenv from 'dotenv'
dotenv.config()

export const organizationsRouter = Router()
organizationsRouter.use(setRoutePermission.setRouteResources('organizations'))

organizationsRouter.get(
    '/:id',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    OrganizationsController.findById
)
organizationsRouter.get(
    '/',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    OrganizationsController.getAllOrganizations
)

organizationsRouter.post(
    '/add',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    OrganizationsController.add
)

if (process.env.NODE_ENV === 'test') {
    organizationsRouter.post(
        '/add-test',

        OrganizationsController.add
    )
}
