import express from 'express'
import { EmployeeController } from '../controller/employee'
import { verifyToken } from '../middleware/verifyToken'
import { authoEmployee } from '../middleware/authEmployee'
import { setRoutePermission } from '../middleware/loadPermission'

export const employeeRouter = express.Router()

employeeRouter.get(
    '/',
    verifyToken,
    setRoutePermission.loadRoutePermission,
    authoEmployee,
    EmployeeController.getAll
)
employeeRouter.get('/username', verifyToken, EmployeeController.findByUsername)
employeeRouter.get('/:id', verifyToken, EmployeeController.findEmployeeById)

employeeRouter.post('/add', verifyToken, EmployeeController.add)
employeeRouter.post('/login', EmployeeController.login)
employeeRouter.post('/logout', verifyToken, EmployeeController.logout)

if (process.env.NODE_ENV === 'test') {
    employeeRouter.delete('/', verifyToken, EmployeeController.delete)
}
