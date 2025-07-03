import { Router } from 'express'
import { UserPermissionController } from '../controller/userPermission'
import { verifyToken } from '../middleware/verifyToken'
import { setRoutePermission } from '../middleware/loadPermission'
import { auth } from '../middleware/auth'
import dotenv from 'dotenv'

dotenv.config()

export const userPermissionRouter = Router()

userPermissionRouter.get(
    '/',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    UserPermissionController.getAll
)
userPermissionRouter.get(
    '/userId/:userId',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    UserPermissionController.getByUserId
)

userPermissionRouter.post(
    '/add',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    UserPermissionController.add
)

if (process.env.NODE_ENV === 'test') {
    userPermissionRouter.post('/add-admin', UserPermissionController.add)
}
