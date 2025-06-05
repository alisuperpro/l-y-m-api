import express from 'express'
import { EmployeeController } from '../controller/employee'

export const employeeRouter = express.Router()

employeeRouter.get('/', EmployeeController.getAll)
employeeRouter.get('/username', EmployeeController.findByUsername)
employeeRouter.get('/:id', EmployeeController.findEmployeeById)

employeeRouter.post('/add', EmployeeController.add)

if (process.env.NODE_ENV === 'test') {
    employeeRouter.delete('/', EmployeeController.delete)
}
