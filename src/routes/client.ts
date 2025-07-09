import express from 'express'
import { ClientController } from '../controller/client'
import { verifyToken } from '../middleware/verifyToken'
import { setRoutePermission } from '../middleware/loadPermission'
import { auth } from '../middleware/auth'
import dotenv from 'dotenv'

dotenv.config()

export const clientRouter = express.Router()
clientRouter.use(setRoutePermission.setRouteResources('clients'))

clientRouter.get(
    '/',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    ClientController.getAll
)
clientRouter.get(
    '/username',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    ClientController.findByUsername
)

clientRouter.get(
    '/:id',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    ClientController.findClientById
)

clientRouter.get(
    '/:createdBy/all',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    ClientController.getAllClientsByCreatedBy
)

clientRouter.post(
    '/add',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    ClientController.add
)

clientRouter.post('/login', ClientController.login)
clientRouter.post('/logout', ClientController.logout)

clientRouter.put(
    '/password/:id',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    ClientController.updatePassword
)

clientRouter.put(
    '/email/:id',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    ClientController.updateEmail
)

if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
    clientRouter.post('/add-test', verifyToken, ClientController.add)
}
