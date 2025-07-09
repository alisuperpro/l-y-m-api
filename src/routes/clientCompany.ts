import { Router } from 'express'
import { ClientCompanyController } from '../controller/clientCompany'
import { verifyToken } from '../middleware/verifyToken'
import { setRoutePermission } from '../middleware/loadPermission'
import { auth } from '../middleware/auth'
import dotenv from 'dotenv'
dotenv.config()

export const clientCompanyRouter = Router()
clientCompanyRouter.use(setRoutePermission.setRouteResources('client_company'))

clientCompanyRouter.get(
    '/client/:clientId',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    ClientCompanyController.findByClientId
)
clientCompanyRouter.get(
    '/:id',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    ClientCompanyController.findById
)

clientCompanyRouter.post(
    '/add',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    ClientCompanyController.add
)

clientCompanyRouter.post(
    '/add-on-list',

    ClientCompanyController.addOnList
)

if (process.env.NODE_ENV === 'test') {
    clientCompanyRouter.post(
        '/add-test',
        verifyToken,
        ClientCompanyController.add
    )
}
