import express from 'express'
import { DebtController } from '../controller/debt'
import { verifyToken } from '../middleware/verifyToken'
import { setRoutePermission } from '../middleware/loadPermission'
import { auth } from '../middleware/auth'

export const debtRouter = express.Router()

debtRouter.use(setRoutePermission.setRouteResources('debt'))

debtRouter.get(
    '/client',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    DebtController.getAllDebtWithAllInfo
)

debtRouter.get(
    '/',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    DebtController.getAll
)

debtRouter.get(
    '/status/:status/all',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    DebtController.getAllDebtsByStatusName
)

debtRouter.get(
    '/:createdBy/all',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    DebtController.getAllDebtWithAllInfoByCreatedBy
)

debtRouter.get(
    '/state/:state',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    DebtController.countDebtsByState
)

debtRouter.get(
    '/:id',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    DebtController.getById
)

debtRouter.post(
    '/add',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    DebtController.add
)

debtRouter.put(
    '/updateStatus',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    auth,
    DebtController.updateStatus
)
