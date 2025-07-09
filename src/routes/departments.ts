import express from 'express'
import { DepartmentsController } from '../controller/departments'
import { verifyToken } from '../middleware/verifyToken'
import { setRoutePermission } from '../middleware/loadPermission'
import { auth } from '../middleware/auth'

export const departmentsRouter = express.Router()

departmentsRouter.use(setRoutePermission.setRouteResources('departments'))

departmentsRouter.get(
    '/',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    DepartmentsController.getAll
)
departmentsRouter.get(
    '/:id',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    DepartmentsController.findById
)

departmentsRouter.post(
    '/add',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    DepartmentsController.add
)

if (process.env.NODE_ENV === 'test') {
    departmentsRouter.delete('/', DepartmentsController.delete)
}
