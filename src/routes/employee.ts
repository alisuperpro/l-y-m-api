import express from 'express'
import { EmployeeController } from '../controller/employee'
import { verifyToken } from '../middleware/verifyToken'

export const employeeRouter = express.Router()
employeeRouter.use(verifyToken)

employeeRouter.get('/', EmployeeController.getAll)
employeeRouter.get('/username', EmployeeController.findByUsername)
employeeRouter.get('/:id', EmployeeController.findEmployeeById)

employeeRouter.post('/add', EmployeeController.add)
employeeRouter.post('/login', EmployeeController.login)
employeeRouter.post('/logout', EmployeeController.logout)

if (process.env.NODE_ENV === 'test') {
    employeeRouter.delete('/', EmployeeController.delete)
}
