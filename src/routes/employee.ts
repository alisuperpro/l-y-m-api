import express from 'express'
import { EmployeeController } from '../controller/employee'
import { verifyToken } from '../middleware/verifyToken'
import { setRoutePermission } from '../middleware/loadPermission'
import { auth } from '../middleware/auth'
import { CanApproveOtherDebtsController } from '../controller/canApproveOtherDebts'
import dotenv from 'dotenv'
import { verifyExpireClientDebts } from '../middleware/verifyExpireClientDebt'

dotenv.config()

export const employeeRouter = express.Router()

employeeRouter.use(setRoutePermission.setRouteResources('employee'))

employeeRouter.get(
    '/',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    EmployeeController.getAll
)
employeeRouter.get(
    '/username',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    EmployeeController.findByUsername
)
employeeRouter.get(
    '/:id',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    EmployeeController.findEmployeeById
)

employeeRouter.get(
    '/creator/:creatorId/approvers',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    CanApproveOtherDebtsController.findByCreatorId
)

employeeRouter.get(
    '/approver/:approverId',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    CanApproveOtherDebtsController.findByApproverId
)

employeeRouter.get(
    '/user/token',
    verifyToken,
    EmployeeController.getUserByToken
)

employeeRouter.get(
    '/client/is-debt-expired/:state/:clientId',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    EmployeeController.isClientDebtExpired
)

employeeRouter.post(
    '/add',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    EmployeeController.add
)

employeeRouter.post(
    '/add-approver',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    CanApproveOtherDebtsController.add
)

employeeRouter.post('/login', EmployeeController.login)
employeeRouter.post('/logout', EmployeeController.logout)

if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
    employeeRouter.post('/add-admin', EmployeeController.add)
}
